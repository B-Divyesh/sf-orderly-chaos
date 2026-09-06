export const COMPARISON_BUDGET = 9;
export const FREE_SEED = 'free-paper-moon';
export const DEMO_SEED = 'demo-brass-beetle';

export type GameStatus = 'active' | 'won' | 'lost';

export interface Exhibit {
  id: string;
  name: string;
  mark: string;
  shape: 'round' | 'angled' | 'arched' | 'folded' | 'striped' | 'dotted';
}

export interface Comparison {
  lighter: string;
  heavier: string;
}

export type CaseRule =
  | { kind: 'lightest'; exhibit: string }
  | { kind: 'heaviest'; exhibit: string }
  | { kind: 'adjacent'; lighter: string; heavier: string }
  | { kind: 'between'; lighter: string; middle: string; heavier: string }
  | { kind: 'one-between'; lighter: string; heavier: string };

export interface GameState {
  seed: string;
  proposal: string[];
  selected: string[];
  comparisons: Comparison[];
  tokensLeft: number;
  status: GameStatus;
  message: string;
  elapsedTicks: number;
}

export interface CaseDefinition {
  seed: string;
  number: number;
  title: string;
  exhibits: Exhibit[];
  hiddenOrder: string[];
  startingOrder: string[];
  given: Comparison;
  rule: CaseRule;
  ruleText: string;
}

const COLLECTIONS = [
  ['Paper Moon', 'Ceramic Spiral', 'Glass Seed', 'Copper Bird', 'Stone Ribbon', 'Wooden Comet'],
  ['Brass Beetle', 'Velvet Gear', 'Porcelain Echo', 'Tin Cloud', 'Marble Feather', 'Cork Planet'],
  ['Ivory Raindrop', 'Iron Bloom', 'Canvas Shell', 'Silver Twig', 'Clay Lantern', 'Wool Compass'],
  ['Quartz Acorn', 'Bronze Kite', 'Paper Fossil', 'Glass Thimble', 'Oak Wave', 'Ceramic Star'],
  ['Stone Whistle', 'Copper Petal', 'Velvet Cog', 'Tin Crescent', 'Wooden Flame', 'Marble Loop'],
  ['Amber Pendulum', 'Slate Bubble', 'Willow Crown', 'Pewter Leaf', 'Cotton Prism', 'Coral Key'],
  ['Bamboo Bell', 'Granite Moth', 'Silk Anchor', 'Nickel Rose', 'Chalk Orbit', 'Leather Star'],
  ['Cedar Teardrop', 'Opal Wheel', 'Felt Arrow', 'Steel Blossom', 'Parchment Shell', 'Brass Wave'],
  ['Cork Ladder', 'Crystal Finch', 'Iron Halo', 'Canvas Pearl', 'Copper Root', 'Clay Sail'],
  ['Paper Lantern', 'Marble Wren', 'Velvet Pebble', 'Silver Reed', 'Oak Spiral', 'Tin Sun'],
  ['Quartz Button', 'Wool Kite', 'Bronze Seed', 'Glass Fan', 'Birch Moon', 'Ceramic Thread'],
  ['Stone Crown', 'Copper Shell', 'Linen Comet', 'Iron Petal', 'Amber Loop', 'Paper Compass'],
  ['Slate Feather', 'Brass Acorn', 'Silk Crescent', 'Marble Twig', 'Willow Gear', 'Clay Star'],
  ['Glass Ribbon', 'Oak Raindrop', 'Felt Planet', 'Nickel Bloom', 'Parchment Kite', 'Ceramic Echo'],
  ['Tin Feather', 'Coral Spiral', 'Cotton Bird', 'Granite Seed', 'Pewter Moon', 'Bamboo Wave'],
  ['Bronze Thimble', 'Canvas Comet', 'Silver Shell', 'Cork Blossom', 'Quartz Petal', 'Wool Halo'],
  ['Iron Acorn', 'Paper Gear', 'Amber Wren', 'Slate Orbit', 'Birch Lantern', 'Glass Root'],
  ['Velvet Arrow', 'Copper Planet', 'Clay Crown', 'Silk Whistle', 'Oak Seed', 'Marble Sail'],
  ['Ceramic Moth', 'Nickel Ribbon', 'Parchment Bloom', 'Brass Moon', 'Felt Ladder', 'Stone Reed'],
  ['Willow Thimble', 'Tin Compass', 'Coral Cloud', 'Cotton Fossil', 'Granite Flame', 'Silver Loop'],
] as const;

const MARKS = ['○', '△', '⌒', '◇', '≋', '••'] as const;
const SHAPES: Exhibit['shape'][] = ['round', 'angled', 'arched', 'folded', 'striped', 'dotted'];
export const CASE_SEEDS = [
  FREE_SEED,
  'case-02-quiet-copper', 'case-03-glass-arc', 'case-04-folded-stone', 'case-05-paper-orbit',
  'case-06-brass-thread', 'case-07-marble-knot', 'case-08-velvet-angle', 'case-09-porcelain-rain',
  'case-10-tin-bloom', 'case-11-oak-signal', 'case-12-silver-fold', 'case-13-canvas-comet',
  'case-14-quartz-wing', 'case-15-ceramic-loop', 'case-16-copper-echo', 'case-17-wool-planet',
  'case-18-iron-petal', 'case-19-cork-moon', 'case-20-stone-compass',
] as const;

export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function nextRandom(state: { value: number }): number {
  state.value = (Math.imul(state.value, 1664525) + 1013904223) >>> 0;
  return state.value / 4294967296;
}

function shuffled<T>(items: readonly T[], state: { value: number }): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(nextRandom(state) * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function createCase(seed: string): CaseDefinition {
  const seedHash = hashSeed(seed);
  const knownCaseIndex = CASE_SEEDS.indexOf(seed as (typeof CASE_SEEDS)[number]);
  const collection = COLLECTIONS[knownCaseIndex >= 0 ? knownCaseIndex : seedHash % COLLECTIONS.length];
  const exhibits = collection.map((name, index) => ({
    id: `item-${index}`,
    name,
    mark: MARKS[index],
    shape: SHAPES[index],
  }));
  const rng = { value: seedHash };
  const hiddenOrder = shuffled(exhibits.map((item) => item.id), rng);
  let startingOrder = shuffled(exhibits.map((item) => item.id), rng);
  if (startingOrder.every((id, index) => id === hiddenOrder[index])) {
    startingOrder = [...startingOrder.slice(1), startingOrder[0]];
  }
  const number = knownCaseIndex >= 0 ? knownCaseIndex + 1 : (seedHash % 19) + 2;
  const name = (id: string) => exhibits.find((item) => item.id === id)?.name ?? id;
  const ruleIndex = (knownCaseIndex >= 0 ? knownCaseIndex : seedHash) % 5;
  const rule: CaseRule = ruleIndex === 0
    ? { kind: 'lightest', exhibit: hiddenOrder[0] }
    : ruleIndex === 1
      ? { kind: 'heaviest', exhibit: hiddenOrder[5] }
      : ruleIndex === 2
        ? { kind: 'adjacent', lighter: hiddenOrder[2], heavier: hiddenOrder[3] }
        : ruleIndex === 3
          ? { kind: 'between', lighter: hiddenOrder[1], middle: hiddenOrder[3], heavier: hiddenOrder[5] }
          : { kind: 'one-between', lighter: hiddenOrder[1], heavier: hiddenOrder[3] };
  const ruleText = rule.kind === 'lightest'
    ? `${name(rule.exhibit)} is the lightest exhibit.`
    : rule.kind === 'heaviest'
      ? `${name(rule.exhibit)} is the heaviest exhibit.`
      : rule.kind === 'adjacent'
        ? `${name(rule.lighter)} sits directly before ${name(rule.heavier)}.`
        : rule.kind === 'between'
          ? `${name(rule.middle)} sits between ${name(rule.lighter)} and ${name(rule.heavier)}.`
          : `Exactly one exhibit sits between ${name(rule.lighter)} and ${name(rule.heavier)}.`;
  return {
    seed,
    number,
    title: knownCaseIndex === 0 ? 'The first weighing' : `Archive case ${String(number).padStart(2, '0')}`,
    exhibits,
    hiddenOrder,
    startingOrder,
    given: { lighter: hiddenOrder[1], heavier: hiddenOrder[4] },
    rule,
    ruleText,
  };
}

export function newGame(seed = FREE_SEED): GameState {
  return {
    seed,
    proposal: createCase(seed).startingOrder,
    selected: [],
    comparisons: [],
    tokensLeft: COMPARISON_BUDGET,
    status: 'active',
    message: 'Select two exhibits to compare their weights.',
    elapsedTicks: 0,
  };
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)])
    .map((rest) => [item, ...rest]));
}

export function orderMatchesRule(order: readonly string[], rule: CaseRule): boolean {
  const position = (id: string) => order.indexOf(id);
  switch (rule.kind) {
    case 'lightest': return position(rule.exhibit) === 0;
    case 'heaviest': return position(rule.exhibit) === order.length - 1;
    case 'adjacent': return position(rule.heavier) - position(rule.lighter) === 1;
    case 'between': return position(rule.lighter) < position(rule.middle) && position(rule.middle) < position(rule.heavier);
    case 'one-between': return position(rule.heavier) - position(rule.lighter) === 2;
  }
}

export function possibleOrders(gameCase: CaseDefinition, comparisons: Comparison[]): string[][] {
  const ids = gameCase.exhibits.map((item) => item.id);
  const facts = [gameCase.given, ...comparisons];
  return permutations(ids).filter((order) => orderMatchesRule(order, gameCase.rule) && facts.every(({ lighter, heavier }) =>
    order.indexOf(lighter) < order.indexOf(heavier)));
}

export function allRelations(gameCase: CaseDefinition, comparisons: Comparison[]): Comparison[] {
  const ids = gameCase.exhibits.map((item) => item.id);
  const candidates = possibleOrders(gameCase, comparisons);
  if (candidates.length === 0) return [];
  return ids.flatMap((lighter) => ids
    .filter((heavier) => lighter !== heavier && candidates.every((order) => order.indexOf(lighter) < order.indexOf(heavier)))
    .map((heavier) => ({ lighter, heavier })));
}

export function selectForComparison(state: GameState, id: string): GameState {
  if (state.status !== 'active') return state;
  if (state.selected.includes(id)) {
    return { ...state, selected: state.selected.filter((item) => item !== id), message: 'Selection removed.' };
  }
  if (state.selected.length === 0) {
    return { ...state, selected: [id], message: 'Choose one more exhibit.' };
  }
  if (state.tokensLeft <= 0) {
    return { ...state, selected: [], message: 'No comparisons remain. Arrange the exhibits and submit your order.' };
  }
  const gameCase = createCase(state.seed);
  const first = state.selected[0];
  const relations = allRelations(gameCase, state.comparisons);
  const known = relations.find((relation) =>
    (relation.lighter === first && relation.heavier === id) ||
    (relation.lighter === id && relation.heavier === first));
  const byId = new Map(gameCase.exhibits.map((item) => [item.id, item]));
  if (known) {
    return {
      ...state,
      selected: [],
      message: `Already known: ${byId.get(known.lighter)?.name} is lighter than ${byId.get(known.heavier)?.name}.`,
    };
  }
  const firstWeight = gameCase.hiddenOrder.indexOf(first);
  const secondWeight = gameCase.hiddenOrder.indexOf(id);
  const comparison = firstWeight < secondWeight ? { lighter: first, heavier: id } : { lighter: id, heavier: first };
  return {
    ...state,
    selected: [],
    comparisons: [...state.comparisons, comparison],
    tokensLeft: state.tokensLeft - 1,
    message: `${byId.get(comparison.lighter)?.name} is lighter than ${byId.get(comparison.heavier)?.name}.`,
  };
}

export function moveProposal(state: GameState, id: string, direction: -1 | 1): GameState {
  if (state.status !== 'active') return state;
  const index = state.proposal.indexOf(id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= state.proposal.length) return state;
  const proposal = [...state.proposal];
  [proposal[index], proposal[target]] = [proposal[target], proposal[index]];
  return { ...state, proposal, message: 'Order updated. Submit when the row runs from lightest to heaviest.' };
}

export function submitOrder(state: GameState): GameState {
  if (state.status !== 'active') return state;
  const correct = createCase(state.seed).hiddenOrder.every((id, index) => state.proposal[index] === id);
  return {
    ...state,
    selected: [],
    status: correct ? 'won' : 'lost',
    message: correct ? 'The order is correct.' : 'That order is not correct. Review the answer and try again.',
  };
}

export function isSavedGame(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GameState>;
  return typeof candidate.seed === 'string' && Array.isArray(candidate.proposal) &&
    Array.isArray(candidate.selected) && Array.isArray(candidate.comparisons) &&
    typeof candidate.tokensLeft === 'number' && ['active', 'won', 'lost'].includes(candidate.status ?? '');
}
