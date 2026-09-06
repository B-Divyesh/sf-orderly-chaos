import './style.css';
import {
  allRelations,
  CASE_SEEDS,
  COMPARISON_BUDGET,
  createCase,
  DEMO_SEED,
  FREE_SEED,
  isSavedGame,
  moveProposal,
  newGame,
  selectForComparison,
  submitOrder,
  type GameState,
} from './game';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root is missing');
const app: HTMLDivElement = appRoot;

const REAL_GAME_KEY = 'orderly-chaos:game';
const DEMO_GAME_KEY = 'demo:orderly-chaos:game';
const SETTINGS_KEY = 'orderly-chaos:settings';
const ROOM_KEY = 'orderly-chaos:room';
const LICENSE_KEY = 'sb_license:orderly-chaos';
const LICENSE_CACHE_KEY = 'orderly-chaos:license-verdict';
const PRODUCT_ORIGIN = 'https://orderly-chaos.sociobot.in';
const VERIFY_URL = 'https://api.sociobot.in/api/v1/products/orderly-chaos/verify';

type RouteName = 'home' | 'demo' | 'privacy' | 'terms' | 'license' | 'not-found';
interface Settings { sound: boolean; reducedMotion: boolean }
interface RoomSession { code: string; seed: string; player: number; playerToken: string; expiresAt: number }
interface RoomPlayer { player: number; comparisonsUsed: number; status: 'active' | 'won' | 'lost'; efficiency?: number }
interface RoomView { code: string; seed: string; expiresAt: number; players: RoomPlayer[] }
interface LicenseVerdict { valid: boolean; checkedAt: number }

let gameState: GameState | null = null;
let roomSession = readJson<RoomSession>(sessionStorage, ROOM_KEY);
let roomView: RoomView | null = null;
let roomError = '';
let licenseNotice = '';
let roomPoll: number | undefined;

function routeName(): RouteName {
  if (location.search.includes('demo=1')) return 'demo';
  switch (location.pathname.replace(/\/$/, '') || '/') {
    case '/': return 'home';
    case '/demo': return 'demo';
    case '/privacy': return 'privacy';
    case '/terms': return 'terms';
    case '/license': return 'license';
    default: return 'not-found';
  }
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function settings(): Settings {
  return { sound: false, reducedMotion: false, ...(readJson<Settings>(localStorage, SETTINGS_KEY) ?? {}) };
}

function loadGame(route: RouteName): GameState | null {
  const key = route === 'demo' ? DEMO_GAME_KEY : REAL_GAME_KEY;
  const stored = readJson<unknown>(localStorage, key);
  if (isSavedGame(stored)) return stored;
  if (route === 'demo') {
    const sample = newGame(DEMO_SEED);
    localStorage.setItem(DEMO_GAME_KEY, JSON.stringify(sample));
    return sample;
  }
  return null;
}

function saveGame(): void {
  if (!gameState) return;
  const key = routeName() === 'demo' ? DEMO_GAME_KEY : REAL_GAME_KEY;
  localStorage.setItem(key, JSON.stringify(gameState));
}

function currentTitle(route: RouteName): string {
  switch (route) {
    case 'demo': return 'Demo — Orderly Chaos';
    case 'privacy': return 'Privacy — Orderly Chaos';
    case 'terms': return 'Terms — Orderly Chaos';
    case 'license': return 'Restore the case pack — Orderly Chaos';
    case 'not-found': return 'Page not found — Orderly Chaos';
    default: return 'Orderly Chaos — solve a limited-comparison puzzle';
  }
}

function updateMetadata(route: RouteName): void {
  document.title = currentTitle(route);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const path = route === 'not-found' ? location.pathname : route === 'home' ? '/' : `/${route}`;
  canonical?.setAttribute('href', `${PRODUCT_ORIGIN}${path}`);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${PRODUCT_ORIGIN}${path}`);
  document.documentElement.dataset.motion = settings().reducedMotion ? 'reduced' : 'full';
}

function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  licenseNotice = 'License received. Verification is in progress.';
}

function isLicensed(): boolean {
  return readJson<LicenseVerdict>(localStorage, LICENSE_CACHE_KEY)?.valid === true;
}

async function verifyStoredLicense(force = false): Promise<void> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return;
  const verdict = readJson<LicenseVerdict>(localStorage, LICENSE_CACHE_KEY);
  if (!force && verdict && Date.now() - verdict.checkedAt < 86_400_000) return;
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid?: boolean; reason?: string };
    const valid = response.ok && result.valid === true;
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid, checkedAt: Date.now() } satisfies LicenseVerdict));
    licenseNotice = valid ? 'Case pack verified. All 20 cases are ready.' : 'This license is not active. Check the token or buy the case pack.';
  } catch {
    licenseNotice = 'The license service could not be reached. The free case still works.';
  }
  if (routeName() === 'license') render(false);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character);
}

function header(route: RouteName): string {
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-route><span class="wordmark-mark" aria-hidden="true">↕</span>Orderly Chaos</a>
      <nav class="site-nav" aria-label="Main navigation">
        <ul>
          <li><a href="/" data-route ${route === 'home' ? 'aria-current="page"' : ''}>Play</a></li>
          <li><a href="/demo" data-route ${route === 'demo' ? 'aria-current="page"' : ''}>Demo</a></li>
          <li><a href="/privacy" data-route ${route === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a></li>
        </ul>
      </nav>
    </header>
    ${route === 'demo' ? demoBanner() : ''}
    <div class="route-announcer" aria-live="polite" id="route-announcer"></div>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo status">
    <span><strong>Demo</strong> Sample data. Nothing is saved to your real game.</span>
    <button type="button" id="reset-demo">Reset demo</button>
    <button type="button" class="button-secondary" id="start-real">Start for real</button>
  </aside>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <p>Order six museum exhibits with limited comparisons. Original generated archive artwork is used on this site.</p>
      <nav aria-label="Footer navigation">
        <a href="/privacy" data-route>Privacy</a>
        <a href="/terms" data-route>Terms</a>
        <a href="https://sociobot.in/" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a>
      </nav>
      <p class="build-line">Version 1.0.0 · Build ${escapeHtml(__BUILD_SHA__)}</p>
    </div>
  </footer>`;
}

function homePage(route: 'home' | 'demo'): string {
  const isDemo = route === 'demo';
  const preview = !gameState;
  return `<main id="main">
    <section class="first-screen" aria-labelledby="page-title">
      <div class="intro-panel">
        <div class="intro-copy">
          <p class="eyebrow">One or two-player browser puzzle</p>
          <h1 id="page-title" tabindex="-1">${isDemo ? 'Solve the sample ordering puzzle' : 'Solve an ordering puzzle with limited comparisons'}</h1>
          <p class="audience-line">For curious adults and teens who want a five-minute deduction game without a long rules lesson.</p>
          <div class="hero-actions">
            ${isDemo
              ? '<button type="button" id="focus-game">Play the sample case</button>'
              : '<a class="button" href="/demo" data-route>Try it with sample data</a><button type="button" class="button-secondary" id="start-solo">Start the free case</button>'}
            <span class="action-note">${isDemo ? 'The complete case is ready below.' : 'The sample opens a complete case and does not change your saved game.'}</span>
          </div>
          <ul class="facts" aria-label="Game facts">
            <li>Solo progress stays in this browser.</li>
            <li>Two-player room codes expire after 24 hours.</li>
            <li>The 19-case pack costs $6 once.</li>
          </ul>
        </div>
        <figure class="hero-figure">
          <picture>
            <source media="(max-width: 800px)" srcset="/art/balance-archive-720.webp" />
            <img src="/art/balance-archive-1280.webp" width="1280" height="853" alt="Six unusual museum objects arranged on a large brass balance in an archive." fetchpriority="high" decoding="async" />
          </picture>
          <figcaption>Six objects. One hidden order.</figcaption>
        </figure>
      </div>
      ${renderGame(gameState ?? newGame(isDemo ? DEMO_SEED : FREE_SEED), preview)}
    </section>
    ${isDemo ? '' : landingSections()}
  </main>`;
}

function itemName(gameCase: ReturnType<typeof createCase>, id: string): string {
  return gameCase.exhibits.find((item) => item.id === id)?.name ?? 'Unknown exhibit';
}

function renderGame(state: GameState, preview: boolean): string {
  const gameCase = createCase(state.seed);
  const exhibitMap = new Map(gameCase.exhibits.map((item) => [item.id, item]));
  const relations = allRelations(gameCase, state.comparisons);
  const comparisonCount = COMPARISON_BUDGET - state.tokensLeft;
  const disabled = preview || state.status !== 'active';
  const exhibits = state.proposal.map((id, index) => {
    const exhibit = exhibitMap.get(id)!;
    const selected = state.selected.includes(id);
    return `<article class="exhibit-card" data-selected="${selected}">
      <button type="button" class="compare-card" data-compare="${id}" aria-pressed="${selected}" ${disabled ? 'disabled' : ''}>
        <span class="position-number">Position ${index + 1}</span>
        <span class="exhibit-mark shape-${exhibit.shape}" aria-hidden="true">${exhibit.mark}</span>
        <span class="exhibit-name">${exhibit.name}</span>
      </button>
      <span class="sr-only">Move ${exhibit.name}</span>
      <div class="move-controls">
        <button type="button" data-move="${id}" data-direction="-1" aria-label="Move ${exhibit.name} toward lightest" ${disabled || index === 0 ? 'disabled' : ''}>←</button>
        <button type="button" data-move="${id}" data-direction="1" aria-label="Move ${exhibit.name} toward heaviest" ${disabled || index === 5 ? 'disabled' : ''}>→</button>
      </div>
    </article>`;
  }).join('');
  const clueItems = relations.slice(0, 12).map(({ lighter, heavier }) =>
    `<li>${itemName(gameCase, lighter)} is lighter than ${itemName(gameCase, heavier)}</li>`).join('');
  return `<section class="game-shell" id="game-board" aria-labelledby="game-heading" data-game-status="${state.status}">
    <header class="game-header">
      <div>
        <p class="case-kicker">Case ${String(gameCase.number).padStart(2, '0')} · Seed ${escapeHtml(gameCase.seed)}</p>
        <h2 class="game-title" id="game-heading">${gameCase.title}</h2>
      </div>
      <dl class="game-stats">
        <dt>Comparisons</dt><dd id="comparison-count">${comparisonCount}/${COMPARISON_BUDGET}</dd>
        <dt>Time</dt><dd id="elapsed-time">${formatTime(state.elapsedTicks)}</dd>
      </dl>
    </header>
    <div class="game-instructions">
      <p><strong>Goal:</strong> Put all six exhibits in order from lightest to heaviest.</p>
      <button type="button" class="button-quiet" id="open-rules">Read controls</button>
    </div>
    <p class="status-message" id="game-status" aria-live="polite">${preview ? 'Start a case to compare and move the exhibits.' : escapeHtml(state.message)}</p>
    <div class="exhibit-scroll" tabindex="0" aria-label="Proposed exhibit order. Scroll horizontally on a small screen.">
      <div class="exhibit-row">${exhibits}</div>
      <div class="axis-labels" aria-hidden="true"><span>Lightest</span><span>Heaviest</span></div>
    </div>
    <div class="clue-panel">
      <div>
        <h3>Free clue</h3>
        <p class="given-clue"><strong>${gameCase.ruleLabel}:</strong> ${itemName(gameCase, gameCase.given.lighter)} is lighter than ${itemName(gameCase, gameCase.given.heavier)}.</p>
      </div>
      <div>
        <h3>Known order</h3>
        <p class="clue-summary">${relations.length} relation${relations.length === 1 ? '' : 's'}, including deductions.</p>
        <ul class="clue-list">${clueItems}</ul>
      </div>
    </div>
    ${roomSession ? renderRoomPanel() : ''}
    ${state.status === 'active' ? '' : renderEndScreen(state, gameCase)}
    ${preview ? `<div class="preview-cover"><p>The board is ready with six objects and one free clue.</p><button type="button" id="preview-start">Start the free case</button></div>` : `
      <footer class="game-footer">
        <div class="game-actions">
          <button type="button" id="submit-order" ${state.status !== 'active' ? 'disabled' : ''}>Submit this order</button>
          <button type="button" class="button-secondary" id="restart-game">Restart case</button>
          <button type="button" class="button-quiet" id="open-settings">Settings</button>
        </div>
        ${roomSession ? '<button type="button" class="button-quiet" id="leave-room">Leave room</button>' : '<button type="button" class="button-secondary" id="create-room">Create two-player room</button>'}
      </footer>`}
    ${preview || roomSession ? '' : joinRoomForm()}
  </section>
  ${rulesDialog()}
  ${settingsDialog()}`;
}

function renderEndScreen(state: GameState, gameCase: ReturnType<typeof createCase>): string {
  const used = COMPARISON_BUDGET - state.tokensLeft;
  const correct = gameCase.hiddenOrder.map((id) => itemName(gameCase, id)).join(' → ');
  return `<section class="end-screen ${state.status === 'lost' ? 'loss' : ''}" aria-labelledby="end-heading" aria-live="assertive">
    <h3 id="end-heading">${state.status === 'won' ? 'Case solved' : 'Case lost'}</h3>
    <p>${state.status === 'won'
      ? `You found the complete order with ${used} comparison${used === 1 ? '' : 's'}. ${state.tokensLeft} token${state.tokensLeft === 1 ? '' : 's'} remained.`
      : 'The submitted order was incorrect. The complete order is shown below.'}</p>
    <p class="correct-order">${correct}</p>
    <button type="button" id="play-again">Play this case again</button>
  </section>`;
}

function renderRoomPanel(): string {
  const players = roomView?.players ?? [{ player: roomSession?.player ?? 1, comparisonsUsed: 0, status: 'active' as const }];
  const playerRows = players.map((player) => `<li>
    <span>Player ${player.player}${player.player === roomSession?.player ? ' (you)' : ''}</span>
    <strong>${player.status === 'active' ? `${player.comparisonsUsed} comparisons` : player.status === 'won' ? `Solved · ${player.efficiency ?? 0} left` : 'Order missed'}</strong>
  </li>`).join('');
  return `<aside class="room-panel" aria-labelledby="room-heading">
    <h3 id="room-heading">Two-player room <span class="room-code">${escapeHtml(roomSession?.code ?? '')}</span></h3>
    <p>Share this five-character code. Each person solves the same case in their own browser.</p>
    <p>Room state is saved by the game service until ${roomSession ? new Date(roomSession.expiresAt * 1000).toLocaleString() : 'expiry'}.</p>
    ${roomError ? `<p class="form-error" role="alert">${escapeHtml(roomError)}</p>` : ''}
    <ul class="room-players">${playerRows}</ul>
    <button type="button" class="button-quiet" id="refresh-room">Refresh room results</button>
  </aside>`;
}

function joinRoomForm(): string {
  return `<div class="room-panel">
    <h3>Join another player</h3>
    <form class="join-form" id="join-room-form" novalidate>
      <label for="room-code-input">Five-character room code</label>
      <div class="form-row">
        <input id="room-code-input" name="roomCode" type="text" inputmode="text" autocomplete="off" minlength="5" maxlength="5" required aria-describedby="room-code-help room-form-error" />
        <button type="submit">Join room</button>
      </div>
      <small id="room-code-help">Letters are not case-sensitive.</small>
      <p class="form-error" id="room-form-error" aria-live="polite">${escapeHtml(roomError)}</p>
    </form>
  </div>`;
}

function rulesDialog(): string {
  return `<dialog id="rules-dialog" aria-labelledby="rules-heading">
    <h2 id="rules-heading">How to control the case</h2>
    <ol>
      <li>Select one exhibit, then another. A new comparison spends one token.</li>
      <li>Use the arrow buttons to move each exhibit toward lightest or heaviest.</li>
      <li>Submit the row once. A wrong order ends the case.</li>
    </ol>
    <p>The free clue and every comparison can imply more known relations.</p>
    <button type="button" data-close-dialog="rules-dialog">Return to the case</button>
  </dialog>`;
}

function settingsDialog(): string {
  const current = settings();
  return `<dialog id="settings-dialog" aria-labelledby="settings-heading">
    <h2 id="settings-heading">Game settings</h2>
    <div class="settings-grid">
      <label class="toggle-row" for="sound-setting"><span>Play short feedback sounds</span><input id="sound-setting" type="checkbox" ${current.sound ? 'checked' : ''} /></label>
      <label class="toggle-row" for="motion-setting"><span>Reduce interface motion</span><input id="motion-setting" type="checkbox" ${current.reducedMotion ? 'checked' : ''} /></label>
    </div>
    <div class="settings-actions">
      <button type="button" id="save-settings">Save settings</button>
      <button type="button" class="button-secondary" data-close-dialog="settings-dialog">Cancel</button>
    </div>
  </dialog>`;
}

function landingSections(): string {
  const paidCases = CASE_SEEDS.slice(1).map((seed, index) =>
    `<li><button type="button" data-case-seed="${seed}">Case ${String(index + 2).padStart(2, '0')}</button></li>`).join('');
  return `<section class="content-section" aria-labelledby="how-heading">
    <p class="eyebrow">How it works</p>
    <h2 id="how-heading">Find the order in three steps</h2>
    <ol class="steps">
      <li><h3>Compare two exhibits</h3><p>Each new comparison tells you which exhibit is lighter and spends one token.</p></li>
      <li><h3>Use the deductions</h3><p>The known-order list adds facts implied by earlier comparisons.</p></li>
      <li><h3>Submit one order</h3><p>Move all six labels from lightest to heaviest, then submit the row.</p></li>
    </ol>
  </section>
  <section class="content-section privacy-grid" aria-labelledby="privacy-heading">
    <div><p class="eyebrow">Scope and privacy</p><h2 id="privacy-heading">A small game with clear limits</h2></div>
    <ul class="plain-list">
      <li>Solo games use local browser storage and need no account.</li>
      <li>Shared rooms store a room code and game results for 24 hours.</li>
      <li>The game has no global ranking, classroom dashboard, ads, or tracking.</li>
      <li>The game does not claim to assess or teach a measured skill.</li>
    </ul>
  </section>
  <section class="content-section paid-grid" id="case-pack" aria-labelledby="pack-heading">
    <div>
      <p class="eyebrow">Complete case pack</p>
      <h2 id="pack-heading">Play all 20 museum cases</h2>
      <p class="price">$6 USD<span>One-time purchase. No subscription.</span></p>
    </div>
    <div>
      <p>The free case stays playable. The purchase adds 19 curated cases with new exhibits, hidden orders, and starting clues.</p>
      <div class="paid-actions">
        <button type="button" disabled>Checkout registration pending</button>
        <a href="/license" data-route>Restore a license</a>
      </div>
      <p><small>Sociobot is the merchant of record. The separate billing operator must register checkout before purchases can begin.</small></p>
      ${licenseNotice ? `<p role="status">${escapeHtml(licenseNotice)}</p>` : ''}
      ${isLicensed() ? `<h3>Choose a paid case</h3><ul class="case-grid">${paidCases}</ul>` : ''}
    </div>
  </section>`;
}

function privacyPage(): string {
  return `<main id="main" class="legal-page">
    <p class="eyebrow">Privacy</p>
    <h1 id="page-title" tabindex="-1">See what this game stores</h1>
    <p>Orderly Chaos does not use analytics, advertising cookies, accounts, or third-party scripts.</p>
    <h2>Solo and demo games</h2>
    <p>Solo progress, settings, and an optional license stay in this browser. Demo progress uses a separate key and is removed when you start for real.</p>
    <h2>Two-player rooms</h2>
    <p>The product service stores the room code, case seed, comparison counts, results, and hashed room access tokens in SQLite. Rooms expire after 24 hours.</p>
    <h2>Purchases</h2>
    <p>Sociobot receives the license during checkout and verification. This site does not receive payment card details.</p>
    <h2>Remove browser data</h2>
    <p>This removes solo progress, demo progress, settings, room access, and the saved license from this browser.</p>
    <button type="button" class="button-danger" id="clear-data">Clear saved browser data</button>
    <p id="clear-data-status" role="status"></p>
  </main>`;
}

function termsPage(): string {
  return `<main id="main" class="legal-page">
    <p class="eyebrow">Terms</p>
    <h1 id="page-title" tabindex="-1">Read the game terms</h1>
    <p>These terms apply to Orderly Chaos. The game is provided as-is for personal entertainment.</p>
    <h2>Free case and rooms</h2>
    <p>The free case may be played without an account. Room codes expire after 24 hours and are limited to two players.</p>
    <h2>One-time case pack</h2>
    <p>The $6 USD purchase unlocks 19 additional cases for this product. It is not a subscription.</p>
    <p>Sociobot is the merchant of record. Its checkout handles payment and refunds. A refunded or revoked license stops unlocking paid cases.</p>
    <h2>Fair use</h2>
    <p>Do not disrupt the room service, bypass access controls, or use the product unlawfully.</p>
    <h2>Contact</h2>
    <p>Questions about this product can be sent to <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p>
  </main>`;
}

function licensePage(): string {
  return `<main id="main" class="legal-page">
    <p class="eyebrow">Case pack license</p>
    <h1 id="page-title" tabindex="-1">Restore the 19-case pack</h1>
    <p>Paste the license from your $6 one-time purchase. It is stored only in this browser and sent to Sociobot for verification.</p>
    <form id="license-form" class="join-form">
      <label for="license-input">License token</label>
      <input id="license-input" name="license" type="text" autocomplete="off" required aria-describedby="license-help license-status" />
      <small id="license-help">The token is included in the return link after checkout.</small>
      <button type="submit">Verify and restore cases</button>
    </form>
    <p id="license-status" role="status">${escapeHtml(licenseNotice)}</p>
    <p><strong>Checkout registration is pending.</strong> The free case remains available.</p>
  </main>`;
}

function notFoundPage(): string {
  return `<main id="main" class="not-found-page">
    <p class="eyebrow">404</p>
    <h1 id="page-title" tabindex="-1">This page is not in the archive</h1>
    <p>The address may be old or mistyped.</p>
    <p><a class="button" href="/" data-route>Return to the ordering puzzle</a></p>
  </main>`;
}

function render(focusHeading = false): void {
  const route = routeName();
  if (route === 'demo' && location.pathname !== '/demo') history.replaceState({}, '', '/demo');
  if (route === 'home' || route === 'demo') gameState = loadGame(route);
  updateMetadata(route);
  const content = route === 'home' || route === 'demo' ? homePage(route) :
    route === 'privacy' ? privacyPage() : route === 'terms' ? termsPage() :
    route === 'license' ? licensePage() : notFoundPage();
  app.innerHTML = `${header(route)}${content}${footer()}`;
  bindEvents();
  manageRoomPolling(route);
  if (focusHeading) {
    const heading = document.querySelector<HTMLElement>('h1');
    heading?.focus();
    const announcer = document.querySelector('#route-announcer');
    if (announcer && heading) announcer.textContent = heading.textContent;
  }
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  window.scrollTo(0, 0);
  render(true);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.pathname);
  }));

  document.querySelector('#start-solo')?.addEventListener('click', () => startCase(FREE_SEED));
  document.querySelector('#preview-start')?.addEventListener('click', () => startCase(FREE_SEED));
  document.querySelector('#focus-game')?.addEventListener('click', () => document.querySelector<HTMLElement>('[data-compare]')?.focus());
  document.querySelector('#reset-demo')?.addEventListener('click', () => {
    localStorage.removeItem(DEMO_GAME_KEY);
    gameState = newGame(DEMO_SEED);
    saveGame();
    render(false);
    document.querySelector<HTMLElement>('#game-board')?.scrollIntoView({ block: 'start' });
  });
  document.querySelector('#start-real')?.addEventListener('click', () => {
    localStorage.removeItem(DEMO_GAME_KEY);
    history.pushState({}, '', '/');
    gameState = newGame(FREE_SEED);
    localStorage.setItem(REAL_GAME_KEY, JSON.stringify(gameState));
    render(true);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!gameState) return;
      gameState = selectForComparison(gameState, button.dataset.compare ?? '');
      saveGame();
      playTone(420);
      void pushRoomProgress(false);
      render(false);
    });
    button.addEventListener('keydown', (event) => {
      if (!gameState || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
      event.preventDefault();
      const id = button.dataset.compare ?? '';
      gameState = moveProposal(gameState, id, event.key === 'ArrowLeft' ? -1 : 1);
      saveGame();
      render(false);
      document.querySelector<HTMLElement>(`[data-compare="${id}"]`)?.focus();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) => button.addEventListener('click', () => {
    if (!gameState) return;
    gameState = moveProposal(gameState, button.dataset.move ?? '', Number(button.dataset.direction) as -1 | 1);
    saveGame();
    render(false);
  }));
  document.querySelector('#submit-order')?.addEventListener('click', () => {
    if (!gameState) return;
    gameState = submitOrder(gameState);
    saveGame();
    playTone(gameState.status === 'won' ? 660 : 180);
    void pushRoomProgress(true);
    render(false);
  });
  document.querySelector('#restart-game')?.addEventListener('click', restartCurrentCase);
  document.querySelector('#play-again')?.addEventListener('click', restartCurrentCase);

  document.querySelector('#open-rules')?.addEventListener('click', () => openDialog('rules-dialog'));
  document.querySelector('#open-settings')?.addEventListener('click', () => openDialog('settings-dialog'));
  document.querySelectorAll<HTMLButtonElement>('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
    document.querySelector<HTMLDialogElement>(`#${button.dataset.closeDialog}`)?.close();
  }));
  document.querySelector('#save-settings')?.addEventListener('click', () => {
    const updated: Settings = {
      sound: document.querySelector<HTMLInputElement>('#sound-setting')?.checked ?? false,
      reducedMotion: document.querySelector<HTMLInputElement>('#motion-setting')?.checked ?? false,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    document.documentElement.dataset.motion = updated.reducedMotion ? 'reduced' : 'full';
    document.querySelector<HTMLDialogElement>('#settings-dialog')?.close();
  });

  document.querySelector('#create-room')?.addEventListener('click', () => void createRoom());
  document.querySelector('#refresh-room')?.addEventListener('click', () => void refreshRoom());
  document.querySelector('#leave-room')?.addEventListener('click', leaveRoom);
  document.querySelector<HTMLFormElement>('#join-room-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('#room-code-input');
    if (!input || !input.checkValidity()) {
      roomError = 'Enter the five-character room code.';
      input?.setAttribute('aria-invalid', 'true');
      const error = document.querySelector('#room-form-error');
      if (error) error.textContent = roomError;
      return;
    }
    void joinRoom(input.value);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-case-seed]').forEach((button) => button.addEventListener('click', () => {
    if (isLicensed()) startCase(button.dataset.caseSeed ?? FREE_SEED);
  }));
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('#license-input');
    const token = input?.value.trim() ?? '';
    if (!token) {
      licenseNotice = 'Paste the license token before verifying it.';
      const status = document.querySelector('#license-status');
      if (status) status.textContent = licenseNotice;
      return;
    }
    localStorage.setItem(LICENSE_KEY, token);
    void verifyStoredLicense(true);
  });
  document.querySelector('#clear-data')?.addEventListener('click', () => {
    if (!window.confirm('Clear saved games, settings, room access, and the saved license from this browser?')) return;
    [REAL_GAME_KEY, DEMO_GAME_KEY, SETTINGS_KEY, LICENSE_KEY, LICENSE_CACHE_KEY].forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem(ROOM_KEY);
    roomSession = null;
    roomView = null;
    const status = document.querySelector('#clear-data-status');
    if (status) status.textContent = 'Saved browser data was cleared.';
  });
}

function startCase(seed: string): void {
  gameState = newGame(seed);
  saveGame();
  render(false);
  document.querySelector<HTMLElement>('#game-board')?.scrollIntoView({ behavior: settings().reducedMotion ? 'auto' : 'smooth', block: 'start' });
  document.querySelector<HTMLElement>('[data-compare]')?.focus({ preventScroll: true });
}

function restartCurrentCase(): void {
  if (!gameState) return;
  const hasProgress = gameState.comparisons.length > 0 && gameState.status === 'active';
  if (hasProgress && !window.confirm('Restart this case and discard its comparisons?')) return;
  gameState = newGame(gameState.seed);
  saveGame();
  void pushRoomProgress(false);
  render(false);
}

function openDialog(id: string): void {
  const dialog = document.querySelector<HTMLDialogElement>(`#${id}`);
  dialog?.showModal();
  dialog?.querySelector<HTMLElement>('button, input')?.focus();
}

function formatTime(ticks: number): string {
  const seconds = Math.floor(ticks / 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function playTone(frequency: number): void {
  if (!settings().sound) return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.035, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .08);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + .08);
  oscillator.addEventListener('ended', () => void context.close());
}

async function apiJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({ error: 'The room service returned an unreadable response.' })) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || 'The room service request failed.');
  return result;
}

async function createRoom(): Promise<void> {
  if (!gameState) return;
  roomError = '';
  try {
    const access = await apiJson<RoomSession>('/api/rooms', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ seed: gameState.seed }),
    });
    roomSession = access;
    sessionStorage.setItem(ROOM_KEY, JSON.stringify(access));
    await refreshRoom();
    render(false);
  } catch (error) {
    roomError = error instanceof Error ? error.message : 'The room could not be created. Solo play still works.';
    render(false);
  }
}

async function joinRoom(rawCode: string): Promise<void> {
  roomError = '';
  try {
    const access = await apiJson<RoomSession>(`/api/rooms/${encodeURIComponent(rawCode.trim().toUpperCase())}/join`, { method: 'POST' });
    roomSession = access;
    sessionStorage.setItem(ROOM_KEY, JSON.stringify(access));
    gameState = newGame(access.seed);
    saveGame();
    await refreshRoom();
    render(false);
  } catch (error) {
    roomError = error instanceof Error ? error.message : 'The room could not be joined. Check the code and try again.';
    const status = document.querySelector('#room-form-error');
    if (status) status.textContent = roomError;
  }
}

async function refreshRoom(): Promise<void> {
  if (!roomSession) return;
  try {
    roomView = await apiJson<RoomView>(`/api/rooms/${encodeURIComponent(roomSession.code)}`, {
      headers: { 'x-room-token': roomSession.playerToken },
    });
    roomError = '';
    const panel = document.querySelector('.room-panel');
    if (panel && (routeName() === 'home' || routeName() === 'demo')) render(false);
  } catch (error) {
    roomError = error instanceof Error ? error.message : 'Room results could not be refreshed.';
  }
}

async function pushRoomProgress(complete: boolean): Promise<void> {
  if (!roomSession || !gameState) return;
  try {
    roomView = await apiJson<RoomView>(`/api/rooms/${encodeURIComponent(roomSession.code)}/progress`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-room-token': roomSession.playerToken },
      body: JSON.stringify({
        comparisonsUsed: COMPARISON_BUDGET - gameState.tokensLeft,
        ...(complete ? { order: gameState.proposal } : {}),
      }),
    });
    roomError = '';
  } catch (error) {
    roomError = error instanceof Error ? error.message : 'Room progress could not be saved.';
  }
}

function leaveRoom(): void {
  sessionStorage.removeItem(ROOM_KEY);
  roomSession = null;
  roomView = null;
  roomError = '';
  render(false);
}

function manageRoomPolling(route: RouteName): void {
  if (roomPoll) window.clearInterval(roomPoll);
  roomPoll = undefined;
  if (roomSession && (route === 'home' || route === 'demo')) {
    roomPoll = window.setInterval(() => void refreshRoom(), 5000);
  }
}

function startFixedLoop(): void {
  let previous = performance.now();
  let accumulator = 0;
  let secondStart = previous;
  let frames = 0;
  const step = 1000 / 60;
  window.__ORDERLY_METRICS__ = { frames: 0, fps: 0, updates: 0 };
  const frame = (now: number) => {
    if (!document.hidden) {
      accumulator += Math.min(now - previous, 250);
      while (accumulator >= step) {
        if (gameState?.status === 'active') {
          gameState.elapsedTicks += 1;
          window.__ORDERLY_METRICS__!.updates += 1;
          if (gameState.elapsedTicks % 60 === 0) {
            const elapsed = document.querySelector('#elapsed-time');
            if (elapsed) elapsed.textContent = formatTime(gameState.elapsedTicks);
            saveGame();
          }
        }
        accumulator -= step;
      }
      frames += 1;
      window.__ORDERLY_METRICS__!.frames += 1;
      if (now - secondStart >= 1000) {
        window.__ORDERLY_METRICS__!.fps = Math.round(frames * 1000 / (now - secondStart));
        secondStart = now;
        frames = 0;
      }
    } else {
      accumulator = 0;
    }
    previous = now;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

window.addEventListener('popstate', () => render(true));
captureLicenseFromUrl();
gameState = loadGame(routeName());
render(false);
void verifyStoredLicense();
startFixedLoop();
