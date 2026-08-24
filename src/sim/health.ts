import { DEATH_CAUSES } from './data/text';
import type { ConditionKind, CrewMember, Pace, Rations } from './types';
import { TUNING } from './types';

export interface DayContext {
  rations: Rations;
  pace: Pace;
  heat: 0 | 1 | 2 | 3;
  hasFood: boolean;
  hasWater: boolean;
  resting: boolean;
}

/**
 * One day of the road, applied to one crew member. Pure: returns a new
 * member, never touches the input.
 */
export function tickMember(member: CrewMember, ctx: DayContext): CrewMember {
  if (!member.alive) return member;

  let delta = 0;
  if (ctx.hasFood) {
    delta += TUNING.rationsHealth[ctx.rations];
  } else {
    delta += TUNING.hungerHealthPerDay;
  }
  if (!ctx.hasWater) {
    delta += TUNING.thirstBaseHealth + TUNING.thirstHeatFactor * ctx.heat;
  }
  if (!ctx.resting) {
    delta += TUNING.paceHealth[ctx.pace];
  } else {
    delta += TUNING.restHealthGain;
  }
  if (ctx.heat === 2) delta += TUNING.heatHealthTier2;
  if (ctx.heat === 3) delta += TUNING.heatHealthTier3;

  for (const c of member.conditions) {
    delta += TUNING.conditionHealthPerDay[c.kind];
  }

  const tick = ctx.resting ? 2 : 1;
  const conditions = member.conditions
    .map((c) => ({ ...c, daysLeft: c.daysLeft - tick }))
    .filter((c) => c.daysLeft > 0);

  const health = Math.max(0, Math.min(100, member.health + delta));
  return {
    ...member,
    health,
    alive: health > 0,
    conditions,
  };
}

export function addCondition(member: CrewMember, kind: ConditionKind, days: number): CrewMember {
  return { ...member, conditions: [...member.conditions, { kind, daysLeft: days }] };
}

/** The line on the memorial. Conditions outrank thirst outrank hunger. */
export function deathCauseFor(member: CrewMember, ctx: DayContext): string {
  const condition = member.conditions[0];
  if (condition) return DEATH_CAUSES[condition.kind];
  if (!ctx.hasWater) return DEATH_CAUSES.thirst;
  if (!ctx.hasFood) return DEATH_CAUSES.hunger;
  return DEATH_CAUSES.injury;
}
