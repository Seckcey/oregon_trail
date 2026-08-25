import { describe, expect, test } from 'vitest';
import { createGame, reduce, view } from '../src/sim/game';
import { assignBalloons, castCrew, distributeLines } from '../src/ui/comic/balloons';
import { arriveAt, departed, run } from './helpers';

describe('castCrew — which of the twelve drawn characters plays each crew member', () => {
  test('the default five are themselves', () => {
    expect(castCrew(['Wes', 'Dot', 'Cache', 'Sol', 'Piper'])).toEqual([1, 2, 3, 4, 5]);
  });

  test('a named character is cast by name wherever they sit; the rest fill unused parts in order', () => {
    expect(castCrew(['Ruby', 'Wes', 'Dusty', 'Kit', 'Lupe'])).toEqual([2, 1, 3, 12, 4]);
  });

  test('names are matched loosely and never cast the same part twice', () => {
    expect(castCrew(['  sol ', 'SOL', 'Bo', 'bo', 'Hank'])).toEqual([4, 1, 10, 2, 6]);
  });

  test('a crew bigger than the cast wraps around', () => {
    const cast = castCrew(Array.from({ length: 14 }, (_, i) => `Crew${i}`));
    expect(cast).toHaveLength(14);
    expect(cast.slice(0, 12)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(cast[12]).toBe(1);
  });
});

describe('assignBalloons — choices become speech balloons from the crew, utilities become signs', () => {
  test('on the road, the crew takes turns speaking the choices; menus are road signs', () => {
    const screen = view(departed());
    const { balloons, signs } = assignBalloons(screen);
    expect(balloons.map((b) => b.label)).toEqual(['Drive on', 'Rest a day', 'Snack run (spend a day foraging)']);
    expect(balloons.map((b) => b.speakerIndex)).toEqual([0, 1, 2]);
    expect(balloons.map((b) => b.speaker)).toEqual(['M0', 'M1', 'M2']);
    expect(signs.map((s) => s.label)).toEqual(['Change pace', 'Change rations', 'Check supplies', 'Look at the map']);
    expect(balloons[0]!.key).toBe('1');
    expect(balloons[0]!.action).toEqual({ type: 'DRIVE' });
  });

  test('the dead do not speak', () => {
    const s = departed();
    s.crew[1] = { ...s.crew[1]!, alive: false, health: 0 };
    const { balloons } = assignBalloons(view(s));
    expect(balloons.map((b) => b.speakerIndex)).toEqual([0, 2, 3]);
  });

  test('a two-way decision is two crew members arguing', () => {
    const summit = view(arriveAt(departed(), 'laguna-summit'));
    const { balloons, signs } = assignBalloons(summit);
    expect(balloons).toHaveLength(2);
    expect(signs).toHaveLength(0);
    expect(balloons[0]!.speakerIndex).not.toBe(balloons[1]!.speakerIndex);
  });

  test('balloon shapes follow the words: shouts, whispers, and plain speech', () => {
    const { balloons } = assignBalloons(view(departed()));
    expect(balloons.find((b) => b.label.startsWith('Snack run'))!.shape).toBe('shout');
    expect(balloons.find((b) => b.label === 'Rest a day')!.shape).toBe('whisper');
    expect(balloons.find((b) => b.label === 'Drive on')!.shape).toBe('speech');
    const summit = assignBalloons(view(arriveAt(departed(), 'laguna-summit'))).balloons;
    expect(summit[0]!.shape).toBe('shout'); // "Ride the 6% grade"
  });

  test('with nobody aboard yet, choices are bursts with no speaker', () => {
    const title = assignBalloons(view(run(departed(), { type: 'RESTART' })));
    expect(title.balloons.map((b) => b.label)).toEqual(['Hit the road']);
    expect(title.balloons[0]).toMatchObject({ speaker: null, speakerIndex: null, shape: 'burst' });
    expect(title.signs.map((s) => s.label)).toEqual(['How to play', 'About 8 West', 'The 8 West leaderboard']);
    const occupation = assignBalloons(view(reduce(createGame('x'), { type: 'START_NEW' })));
    expect(occupation.balloons).toHaveLength(3);
    expect(occupation.balloons.every((b) => b.speaker === null && b.shape === 'burst')).toBe(true);
  });

  test('the store keeps its price list as signs, and the way out as a balloon', () => {
    let s = run(createGame('x'), { type: 'START_NEW' }, { type: 'CHOOSE_OCCUPATION', occupation: 'ceo' }, { type: 'CHOOSE_MONTH', month: 5 });
    for (let i = 0; i < 5; i++) s = reduce(s, { type: 'SUBMIT_NAME', name: `M${i}` });
    const { balloons, signs } = assignBalloons(view(s));
    expect(signs.map((b) => b.action.type)).toEqual(['BUY', 'BUY', 'BUY', 'BUY', 'BUY', 'BUY']);
    expect(balloons.map((b) => b.label)).toEqual(['Load up and hit the road']);
  });
});

describe('distributeLines — narration across a three-panel strip', () => {
  test('first line opens, last line closes, the middle carries the rest', () => {
    expect(distributeLines(['a'], 3)).toEqual([['a'], [], []]);
    expect(distributeLines(['a', 'b'], 3)).toEqual([['a'], [], ['b']]);
    expect(distributeLines(['a', 'b', 'c'], 3)).toEqual([['a'], ['b'], ['c']]);
    expect(distributeLines(['a', 'b', 'c', 'd', 'e'], 3)).toEqual([['a'], ['b', 'c', 'd'], ['e']]);
  });

  test('blank spacer lines are dropped first', () => {
    expect(distributeLines(['a', '', 'b'], 3)).toEqual([['a'], [], ['b']]);
    expect(distributeLines([], 3)).toEqual([[], [], []]);
  });
});
