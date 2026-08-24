import { describe, expect, test } from 'vitest';
import { addCondition, deathCauseFor, tickMember, type DayContext } from '../src/sim/health';
import type { CrewMember } from '../src/sim/types';

const member = (overrides: Partial<CrewMember> = {}): CrewMember => ({
  name: 'Dot',
  health: 70,
  alive: true,
  conditions: [],
  ...overrides,
});

const day = (overrides: Partial<DayContext> = {}): DayContext => ({
  rations: 'filling',
  pace: 'steady',
  heat: 0,
  hasFood: true,
  hasWater: true,
  resting: false,
  ...overrides,
});

describe('tickMember', () => {
  test('a fed, watered crew member on an easy day recovers 2 health', () => {
    expect(tickMember(member(), day()).health).toBe(72);
  });

  test('health never exceeds 100', () => {
    expect(tickMember(member({ health: 99 }), day()).health).toBe(100);
  });

  test('barebones rations, grueling pace, scorching heat drain 8 health', () => {
    const m = tickMember(member(), day({ rations: 'barebones', pace: 'grueling', heat: 3 }));
    expect(m.health).toBe(70 - 2 - 3 - 3);
  });

  test('a day without water costs 8 health plus 4 per heat tier', () => {
    // filling +2, steady 0, heat 2 => -2, thirst -8 - 8 = -16; net -16
    const m = tickMember(member(), day({ hasWater: false, heat: 2 }));
    expect(m.health).toBe(70 + 2 - 2 - 16);
  });

  test('a day without food costs 10 health and forfeits the ration bonus', () => {
    const m = tickMember(member(), day({ hasFood: false }));
    expect(m.health).toBe(70 - 10);
  });

  test('food poisoning drains 7 per day and expires', () => {
    let m = addCondition(member(), 'food-poisoning', 2);
    m = tickMember(m, day());
    expect(m.health).toBe(70 + 2 - 7);
    expect(m.conditions).toHaveLength(1);
    m = tickMember(m, day());
    expect(m.conditions).toHaveLength(0);
  });

  test('resting adds 8, skips the pace penalty, and heals conditions twice as fast', () => {
    let m = addCondition(member(), 'snakebite', 4);
    m = tickMember(m, day({ pace: 'grueling', resting: true }));
    // filling +2, rest +8, snakebite -8, no pace penalty
    expect(m.health).toBe(70 + 2 + 8 - 8);
    expect(m.conditions[0]?.daysLeft).toBe(2);
  });

  test('a member who hits 0 health dies', () => {
    const m = tickMember(member({ health: 5 }), day({ hasWater: false, heat: 3 }));
    expect(m.alive).toBe(false);
    expect(m.health).toBe(0);
  });

  test('the dead are beyond the reach of the road', () => {
    const dead = member({ alive: false, health: 0 });
    expect(tickMember(dead, day({ hasWater: false }))).toEqual(dead);
  });

  test('does not mutate the input member', () => {
    const m = member();
    tickMember(m, day());
    expect(m.health).toBe(70);
  });
});

describe('deathCauseFor', () => {
  test('an active condition names the cause', () => {
    const m = addCondition(member({ health: 0, alive: false }), 'food-poisoning', 2);
    expect(deathCauseFor(m, day())).toBe('GAS-STATION SUSHI');
  });

  test('thirst outranks hunger', () => {
    const m = member({ health: 0, alive: false });
    expect(deathCauseFor(m, day({ hasWater: false, hasFood: false }))).toBe('THIRST');
  });

  test('hunger names starvation when water was fine', () => {
    const m = member({ health: 0, alive: false });
    expect(deathCauseFor(m, day({ hasFood: false }))).toBe('HUNGER');
  });

  test('with no clearer culprit, the road takes the blame', () => {
    const m = member({ health: 0, alive: false });
    expect(deathCauseFor(m, day())).toBe('THE ROAD');
  });
});
