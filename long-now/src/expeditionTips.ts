/**
 * Exploration planner tips.
 *
 * These are *hints*, not verdicts — some warn, some encourage, some are neutral.
 * Each rule has a `test(ctx)` predicate; every rule whose test passes is shown.
 * Tune the copy / conditions freely later; the planner just renders whatever
 * `getExpeditionTips` returns.
 */

export type TipTone = "warn" | "info" | "good";

export interface ExpeditionTipContext {
  /** chosen duration in days */
  days: number;
  /** how many crew are in the party */
  partySize: number;
  /** longest duration the current supplies allow */
  maxDays: number;
}

export interface ExpeditionTip {
  id: string;
  tone: TipTone;
  text: string;
}

interface TipRule extends ExpeditionTip {
  test: (ctx: ExpeditionTipContext) => boolean;
}

const TONE_ICON: Record<TipTone, string> = {
  warn: "⚠",
  info: "ℹ",
  good: "↑",
};

export function tipIcon(tone: TipTone): string {
  return TONE_ICON[tone];
}

const RULES: TipRule[] = [
  {
    id: "long-morale",
    tone: "warn",
    text: "Long expeditions wear on the crew — the longer they're out past 5 days, the more morale can slip.",
    test: (c) => c.partySize > 0 && c.days > 5,
  },
  {
    id: "too-short",
    tone: "info",
    text: "A single day out rarely turns up much. Push longer if you're after real salvage.",
    test: (c) => c.partySize > 0 && c.days <= 1,
  },
  {
    id: "short-morale-boost",
    tone: "good",
    text: "A brief excursion into open water can lift a restless crewmate's morale.",
    test: (c) => c.partySize > 0 && c.days >= 2 && c.days <= 3,
  },
  {
    id: "supplies-capped",
    tone: "warn",
    text: "Supplies won't stretch any further than this — the party packs only what you can spare.",
    test: (c) => c.partySize > 0 && c.days >= c.maxDays && c.maxDays > 1,
  },
];

/** all tips whose condition currently holds (order = rule order). */
export function getExpeditionTips(ctx: ExpeditionTipContext): ExpeditionTip[] {
  return RULES.filter((r) => r.test(ctx)).map(({ id, tone, text }) => ({ id, tone, text }));
}
