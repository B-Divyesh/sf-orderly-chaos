import { expect, test, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { allRelations, COMPARISON_BUDGET, createCase, DEMO_SEED, FREE_SEED } from '../src/game';

async function orderLikeSolution(page: Page, seed = DEMO_SEED): Promise<void> {
  const gameCase = createCase(seed);
  for (let target = 0; target < gameCase.hiddenOrder.length; target += 1) {
    const id = gameCase.hiddenOrder[target];
    let ids = await page.locator('[data-compare]').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.compare));
    while (ids.indexOf(id) > target) {
      await page.locator(`[data-move="${id}"][data-direction="-1"]`).click();
      ids = await page.locator('[data-compare]').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.compare));
    }
  }
}

async function revealAdjacentFacts(page: Page, seed = DEMO_SEED): Promise<void> {
  const order = createCase(seed).hiddenOrder;
  for (let index = 0; index < order.length - 1; index += 1) {
    await page.locator(`[data-compare="${order[index]}"]`).click();
    await page.locator(`[data-compare="${order[index + 1]}"]`).click();
  }
}

function firstUnknownPair(seed = DEMO_SEED): [string, string] {
  const gameCase = createCase(seed);
  const known = new Set(allRelations(gameCase, []).map(({ lighter, heavier }) => `${lighter}:${heavier}`));
  for (let left = 0; left < gameCase.hiddenOrder.length; left += 1) {
    for (let right = left + 1; right < gameCase.hiddenOrder.length; right += 1) {
      const a = gameCase.hiddenOrder[left];
      const b = gameCase.hiddenOrder[right];
      if (!known.has(`${a}:${b}`) && !known.has(`${b}:${a}`)) return [a, b];
    }
  }
  throw new Error('Case has no unknown comparison');
}

async function solveCase(page: Page, seed = DEMO_SEED): Promise<void> {
  await revealAdjacentFacts(page, seed);
  await orderLikeSolution(page, seed);
  await page.getByRole('button', { name: 'Submit this order' }).click();
}

test('@claim:complete-run a deterministic case reaches a real win screen', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Solve the sample ordering puzzle');
  await expect(page.locator('[data-compare]')).toHaveCount(6);
  await solveCase(page);
  await expect(page.getByRole('heading', { name: 'Case solved' })).toBeVisible();
  await expect(page.locator('.end-screen')).toContainText(/\d+ comparisons/);
  await expect(page.getByRole('button', { name: 'Play this case again' })).toBeVisible();
  if (process.env.EVIDENCE_DIR) {
    await page.screenshot({ path: `${process.env.EVIDENCE_DIR}/live-win-screen.png`, fullPage: true });
  }
});

test('@claim:five-minute-run a deterministic complete round takes less than five minutes', async ({ page }) => {
  const startedAt = Date.now();
  await page.goto('/demo');
  await solveCase(page);
  await expect(page.getByRole('heading', { name: 'Case solved' })).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(300_000);
});

test('@claim:free-case-loop the permanent free case reaches win and loss endings', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-solo').click();
  await solveCase(page, FREE_SEED);
  await expect(page.getByRole('heading', { name: 'Case solved' })).toBeVisible();
  await page.getByRole('button', { name: 'Play this case again' }).click();
  await page.getByRole('button', { name: 'Submit this order' }).click();
  await expect(page.getByRole('heading', { name: 'Case lost' })).toBeVisible();
});

test('an incorrect submitted order reaches the loss screen', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Submit this order' }).click();
  await expect(page.getByRole('heading', { name: 'Case lost' })).toBeVisible();
  await expect(page.locator('.correct-order')).toContainText('→');
});

test('@claim:restart-reset restart restores the full case state', async ({ page }) => {
  await page.goto('/demo');
  const [first, second] = firstUnknownPair();
  await page.locator(`[data-compare="${first}"]`).click();
  await page.locator(`[data-compare="${second}"]`).click();
  await expect(page.locator('#comparison-count')).toHaveText(`1/${COMPARISON_BUDGET}`);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Restart case' }).click();
  await expect(page.locator('#comparison-count')).toHaveText(`0/${COMPARISON_BUDGET}`);
  await expect(page.locator('#game-board')).toHaveAttribute('data-game-status', 'active');
  await expect(page.locator('.clue-list li')).toHaveCount(allRelations(createCase(DEMO_SEED), []).length);
});

test('@claim:progress-persistence solo progress survives a reload', async ({ page }) => {
  await page.goto('/demo');
  const [first, second] = firstUnknownPair();
  await page.locator(`[data-compare="${first}"]`).click();
  await page.locator(`[data-compare="${second}"]`).click();
  await page.reload();
  await expect(page.locator('#comparison-count')).toHaveText(`1/${COMPARISON_BUDGET}`);
  await expect(page.locator('#game-board')).toHaveAttribute('data-game-status', 'active');
});

test('@claim:demo-isolation demo reset never changes saved solo data', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('orderly-chaos:game', JSON.stringify({ sentinel: 'real-progress' })));
  await page.goto('/demo');
  await expect(page.getByLabel('Demo status').getByText('Demo', { exact: true })).toBeVisible();
  const [first, second] = firstUnknownPair();
  await page.locator(`[data-compare="${first}"]`).click();
  await page.locator(`[data-compare="${second}"]`).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const realValue = await page.evaluate(() => localStorage.getItem('orderly-chaos:game'));
  expect(realValue).toContain('real-progress');
  await expect(page.locator('#comparison-count')).toHaveText(`0/${COMPARISON_BUDGET}`);
});

test('@claim:start-real-cleanup starting for real removes all demo progress', async ({ page }) => {
  await page.goto('/demo');
  const [first, second] = firstUnknownPair();
  await page.locator(`[data-compare="${first}"]`).click();
  await page.locator(`[data-compare="${second}"]`).click();
  await expect(page.locator('#comparison-count')).toHaveText(`1/${COMPARISON_BUDGET}`);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByLabel('Demo status')).toHaveCount(0);
  await expect(page.locator('.case-kicker')).toContainText(FREE_SEED);
  await expect(page.locator('#comparison-count')).toHaveText(`0/${COMPARISON_BUDGET}`);
  expect(await page.evaluate(() => localStorage.getItem('demo:orderly-chaos:game'))).toBeNull();
});

test('@claim:settings-persist sound and motion choices survive reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Play short feedback sounds').check();
  await page.getByLabel('Reduce interface motion').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Play short feedback sounds')).toBeChecked();
  await expect(page.getByLabel('Reduce interface motion')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
});

test('@claim:solo-local-privacy solo demo sends no cross-origin requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  const [first, second] = firstUnknownPair();
  await page.locator(`[data-compare="${first}"]`).click();
  await page.locator(`[data-compare="${second}"]`).click();
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
});

test('@claim:control-inputs mouse, keyboard, and touch all change a case', async ({ browser, page }) => {
  await page.goto('/demo');
  const pair = firstUnknownPair();
  await page.locator(`[data-compare="${pair[0]}"]`).click();
  await page.locator(`[data-compare="${pair[1]}"]`).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#comparison-count')).toHaveText(`1/${COMPARISON_BUDGET}`);
  const moveId = (await page.locator('[data-compare]').nth(2).getAttribute('data-compare'))!;
  await page.locator(`[data-compare="${moveId}"]`).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-compare]').nth(1)).toHaveAttribute('data-compare', moveId);

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touchPage = await touchContext.newPage();
  try {
    await touchPage.goto('/demo');
    await touchPage.locator(`[data-compare="${pair[0]}"]`).tap();
    await touchPage.locator(`[data-compare="${pair[1]}"]`).tap();
    await expect(touchPage.locator('#comparison-count')).toHaveText(`1/${COMPARISON_BUDGET}`);
  } finally {
    await touchContext.close();
  }
});

test('@claim:two-player-shared two independent browsers share authoritative room results', async ({ browser }) => {
  if (process.env.LIVE_RESTART === '1') test.setTimeout(180_000);
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  const first = await firstContext.newPage();
  const second = await secondContext.newPage();
  try {
    await first.goto('/demo');
    await first.getByRole('button', { name: 'Create two-player room' }).click();
    const code = (await first.locator('.room-code').textContent())?.trim();
    expect(code).toMatch(/^[A-Z2-9]{5}$/);

    await second.goto('/demo');
    await second.getByLabel('Five-character room code').fill(code!);
    await second.getByRole('button', { name: 'Join room' }).click();
    await expect(second.getByText(`Two-player room ${code}`)).toBeVisible();

    await solveCase(first);
    await expect(first.getByRole('heading', { name: 'Case solved' })).toBeVisible();
    await second.getByRole('button', { name: 'Refresh room results' }).click();
    await expect(second.locator('.room-players li').first()).toContainText('Solved');
    if (process.env.LIVE_RESTART === '1') {
      const { execFileSync } = await import('node:child_process');
      const revision = execFileSync('az', [
        'containerapp', 'revision', 'list', '--name', 'sf-orderly-chaos', '--resource-group', 'sociobot',
        '--query', "[?properties.active && properties.healthState=='Healthy'].name | [0]", '-o', 'tsv',
      ], { encoding: 'utf8' }).trim();
      expect(revision).toMatch(/^sf-orderly-chaos--/);
      execFileSync('az', [
        'containerapp', 'revision', 'restart', '--name', 'sf-orderly-chaos', '--resource-group', 'sociobot', '--revision', revision,
      ]);
      await expect.poll(async () => {
        try {
          return (await second.request.get('/health')).status();
        } catch {
          return 0;
        }
      }, { timeout: 120_000, intervals: [1000, 2000, 3000] }).toBe(200);
      await second.getByRole('button', { name: 'Refresh room results' }).click();
      await expect(second.locator('.room-players li').first()).toContainText('Solved');
    }
  } finally {
    await firstContext.close();
    await secondContext.close();
  }
});

test('@claim:room-expiry server rooms expire in 24 hours', async ({ request }) => {
  const before = Math.floor(Date.now() / 1000);
  const response = await request.post('/api/rooms', { data: { seed: 'expiry-test-case' }, headers: { 'x-forwarded-for': '203.0.113.30' } });
  expect(response.ok()).toBeTruthy();
  const room = await response.json() as { expiresAt: number };
  expect(room.expiresAt).toBeGreaterThanOrEqual(before + 86_395);
  expect(room.expiresAt).toBeLessThanOrEqual(before + 86_405);
});

test('@claim:two-player-limit a third browser cannot join a full room', async ({ playwright }) => {
  const creator = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL as string });
  const second = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL as string });
  const third = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL as string });
  try {
    const created = await creator.post('/api/rooms', { data: { seed: 'two-player-boundary' }, headers: { 'x-forwarded-for': '203.0.113.41' } });
    expect(created.status()).toBe(200);
    const { code } = await created.json() as { code: string };
    expect((await second.post(`/api/rooms/${code}/join`, { headers: { 'x-forwarded-for': '203.0.113.42' } })).status()).toBe(200);
    const rejected = await third.post(`/api/rooms/${code}/join`, { headers: { 'x-forwarded-for': '203.0.113.43' } });
    expect(rejected.status()).toBe(409);
    await expect(rejected.json()).resolves.toMatchObject({ error: 'That room already has two players.' });
  } finally {
    await creator.dispose();
    await second.dispose();
    await third.dispose();
  }
});

test('@release:server-routing delivers the room API, health JSON, and a real 404', async ({ request }) => {
  const health = await request.get('/health');
  expect(health.status()).toBe(200);
  expect(health.headers()['content-type']).toContain('application/json');
  await expect(health.json()).resolves.toMatchObject({ status: 'ok' });

  const room = await request.post('/api/rooms', {
    data: { seed: 'release-routing-check' },
    headers: { 'x-forwarded-for': '198.51.100.88' },
  });
  expect(room.status()).toBe(200);
  expect(room.headers()['content-type']).toContain('application/json');

  const missing = await request.get('/not-a-product-route');
  expect(missing.status()).toBe(404);
  expect(missing.headers()['content-type']).toContain('text/html');
});

test('room state is unavailable without that browser’s room access', async ({ page, request }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Create two-player room' }).click();
  const code = (await page.locator('.room-code').textContent())?.trim();
  expect(code).toMatch(/^[A-Z2-9]{5}$/);

  const response = await request.get(`/api/rooms/${code}`);
  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({
    error: 'Open this room from the browser that created or joined it.',
  });
});

test('@claim:case-pack the one-time license unlocks all 20 cases', async ({ page }) => {
  await page.route(`${VERIFY_URL_PATTERN()}**`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/license?license=recorded-fixture-token');
  await expect(page).toHaveURL('/license');
  await expect(page.locator('#license-status')).toContainText('All 20 cases');
  await page.getByRole('link', { name: 'Orderly Chaos' }).click();
  await expect(page.locator('[data-case-seed]')).toHaveCount(19);
  await expect(page.getByText('$6 USD')).toBeVisible();
  await expect(page.getByText('One-time purchase. No subscription.')).toBeVisible();
});

test('@claim:license-revocation a revoked license removes paid case access', async ({ page }) => {
  let licenseActive = true;
  await page.route(`${VERIFY_URL_PATTERN()}**`, async (route) => {
    await route.fulfill({
      status: licenseActive ? 200 : 403,
      contentType: 'application/json',
      body: JSON.stringify({ valid: licenseActive, reason: licenseActive ? 'ok' : 'revoked', expires_at: null }),
    });
  });
  await page.goto('/license?license=recorded-fixture-token');
  await expect(page.locator('#license-status')).toContainText('All 20 cases');
  licenseActive = false;
  await page.getByLabel('License token').fill('recorded-fixture-token');
  await page.getByRole('button', { name: 'Verify and restore cases' }).click();
  await expect(page.locator('#license-status')).toContainText('not active');
  await page.getByRole('link', { name: 'Orderly Chaos' }).click();
  await expect(page.locator('[data-case-seed]')).toHaveCount(0);
});

function VERIFY_URL_PATTERN(): string {
  return 'https://api.sociobot.in/api/v1/products/orderly-chaos/verify';
}

test('@claim:steady-render active play renders at 50 frames per second or better', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto('/demo');
    await page.waitForTimeout(2200);
    const metrics = await page.evaluate(() => window.__ORDERLY_METRICS__);
    expect(metrics?.fps).toBeGreaterThanOrEqual(50);
    expect(metrics?.updates).toBeGreaterThanOrEqual(100);
  } finally {
    await context.close();
  }
});

test('normal, invalid, boundary, and recovery room paths', async ({ page, request }) => {
  await page.goto('/demo');
  await page.getByLabel('Five-character room code').fill('BAD');
  await page.getByRole('button', { name: 'Join room' }).click();
  await expect(page.locator('#room-form-error')).toContainText('five-character');

  const responses = await Promise.all(Array.from({ length: 12 }, (_, index) => request.post('/api/rooms', {
    data: { seed: `rate-limit-${index}` }, headers: { 'x-forwarded-for': '203.0.113.77' },
  })));
  const statuses = responses.map((response) => response.status());
  const retryAfter = responses.find((response) => response.status() === 429)?.headers()['retry-after'];
  expect(statuses).toContain(429);
  expect(retryAfter).toBe('1');
  const health = await request.get('/health');
  expect(health.status()).toBe(200);
  await expect.poll(async () => (await health.json()).status).toBe('ok');
});

test('route titles, legal pages, and the designed 404 work', async ({ page, request }) => {
  const cases = [
    ['/', /Orderly Chaos — solve/, 'Solve an ordering puzzle with limited comparisons'],
    ['/demo', 'Demo — Orderly Chaos', 'Solve the sample ordering puzzle'],
    ['/privacy', 'Privacy — Orderly Chaos', 'See what this game stores'],
    ['/terms', 'Terms — Orderly Chaos', 'Read the game terms'],
    ['/license', 'Restore the case pack — Orderly Chaos', 'Restore the 19-case pack'],
  ] as const;
  for (const [path, title, heading] of cases) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page.locator('h1')).toHaveCount(1);
  }
  const missing = await request.get('/does-not-exist');
  expect(missing.status()).toBe(404);
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page was not found');
  await expect(page.getByRole('link', { name: /Return to the ordering puzzle/ })).toBeVisible();
});

test('keyboard, mobile, reduced motion, clear data, and accessibility basics', async ({ browser, page }) => {
  await page.goto('/demo');
  await page.locator('[data-compare]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-compare]').first()).toHaveAttribute('aria-pressed', 'true');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('.exhibit-card').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(.001);

  // axe's package may carry newer Playwright types; both use the same runtime page contract.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  await page.getByRole('button', { name: 'Read controls' }).click();
  const dialogResults = await new AxeBuilder({ page: page as never }).analyze();
  expect(dialogResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Return to the case' }).click();

  await page.goto('/privacy');
  await page.evaluate(() => localStorage.setItem('orderly-chaos:settings', '{"sound":true}'));
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear saved browser data' }).click();
  await expect(page.locator('#clear-data-status')).toContainText('was cleared');
  expect(await page.evaluate(() => localStorage.getItem('orderly-chaos:settings'))).toBeNull();

  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneContext.newPage();
  try {
    await phone.goto('/');
    await expect(phone.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(phone.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
    const bodyWidth = await phone.evaluate(() => ({ scroll: document.body.scrollWidth, client: document.documentElement.clientWidth }));
    expect(bodyWidth.scroll).toBeLessThanOrEqual(bodyWidth.client);
  } finally {
    await phoneContext.close();
  }
});

test('all public routes have no serious accessibility issues or console errors', async ({ page, request }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  for (const path of ['/', '/demo', '/privacy', '/terms', '/license']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')), path).toEqual([]);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
  const links = await page.locator('a[href^="/"]').evaluateAll((anchors) => [...new Set(anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')!))]);
  for (const path of links) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  expect(consoleErrors).toEqual([]);
});
