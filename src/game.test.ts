import { describe, expect, it } from 'vitest';
import {
  allRelations,
  COMPARISON_BUDGET,
  CASE_SEEDS,
  createCase,
  FREE_SEED,
  moveProposal,
  newGame,
  orderMatchesRule,
  possibleOrders,
  selectForComparison,
  submitOrder,
} from './game';

describe('deterministic ordering game', () => {
  it('creates the same complete case for one seed', () => {
    expect(createCase(FREE_SEED)).toEqual(createCase(FREE_SEED));
    expect(createCase(FREE_SEED).exhibits).toHaveLength(6);
  });

  it('spends one token on a new comparison and none on a known one', () => {
    const gameCase = createCase(FREE_SEED);
    const known = new Set(allRelations(gameCase, []).map(({ lighter, heavier }) => `${lighter}:${heavier}`));
    const pair = gameCase.hiddenOrder.flatMap((first, index) => gameCase.hiddenOrder.slice(index + 1).map((second) => [first, second] as const))
      .find(([first, second]) => !known.has(`${first}:${second}`) && !known.has(`${second}:${first}`));
    expect(pair).toBeDefined();
    const [first, second] = pair!;
    let state = selectForComparison(newGame(), first);
    state = selectForComparison(state, second);
    expect(state.tokensLeft).toBe(COMPARISON_BUDGET - 1);
    state = selectForComparison(state, first);
    state = selectForComparison(state, second);
    expect(state.tokensLeft).toBe(COMPARISON_BUDGET - 1);
    expect(state.message).toMatch(/Already known/);
  });

  it('derives transitive clues', () => {
    const gameCase = createCase(FREE_SEED);
    const [a, b, c] = gameCase.hiddenOrder;
    const relations = allRelations(gameCase, [{ lighter: a, heavier: b }, { lighter: b, heavier: c }]);
    expect(relations).toContainEqual({ lighter: a, heavier: c });
  });

  it('@claim:case-rules applies a seed-specific placement rule to every curated case', () => {
    const cases = CASE_SEEDS.map((seed) => createCase(seed));
    expect(new Set(cases.map((gameCase) => gameCase.ruleText)).size).toBe(CASE_SEEDS.length);
    expect(new Set(cases.map((gameCase) => gameCase.exhibits.map(({ name }) => name).join('|'))).size).toBe(CASE_SEEDS.length);
    expect(new Set(cases.map((gameCase) => gameCase.rule.kind)).size).toBe(5);
    cases.forEach((gameCase) => {
      expect(orderMatchesRule(gameCase.hiddenOrder, gameCase.rule)).toBe(true);
      expect(possibleOrders(gameCase, [])).toContainEqual(gameCase.hiddenOrder);
      expect(possibleOrders(gameCase, []).length).toBeLessThan(360);
      expect(allRelations(gameCase, []).some(({ lighter, heavier }) =>
        lighter !== gameCase.given.lighter || heavier !== gameCase.given.heavier)).toBe(true);
    });
  });

  it('reaches both real end states', () => {
    const gameCase = createCase(FREE_SEED);
    expect(submitOrder({ ...newGame(), proposal: gameCase.hiddenOrder }).status).toBe('won');
    expect(submitOrder(newGame()).status).toBe('lost');
  });

  it('moves one exhibit by one position without changing the set', () => {
    const start = newGame();
    const id = start.proposal[2];
    const moved = moveProposal(start, id, -1);
    expect(moved.proposal[1]).toBe(id);
    expect(new Set(moved.proposal)).toEqual(new Set(start.proposal));
  });
});
