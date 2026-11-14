import type { FormResult, Match, Prediction } from "@/lib/types";

/**
 * Poisson / Dixon-Coles style match model.
 *
 *   lambda_home = leagueAvgHome * attack(home) * defence(away)
 *   lambda_away = leagueAvgAway * attack(away) * defence(home)
 *
 * P(i, j) = Poisson(lambda_home, i) * Poisson(lambda_away, j)
 *
 * Everything downstream (1X2, over/under, BTTS, correct score, fair odds)
 * is derived from that single scoreline matrix, so the numbers on the
 * Predictions page and the Odds page can never contradict each other.
 */

const MAX_GOALS = 8;
const LEAGUE_AVG_HOME = 1.55;
const LEAGUE_AVG_AWAY = 1.25;
const BOOKMAKER_MARGIN = 0.06;

const FACTORIALS: number[] = (() => {
  const out = [1];
  for (let i = 1; i <= MAX_GOALS; i += 1) out[i] = out[i - 1] * i;
  return out;
})();

export function poissonPmf(k: number, lambda: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / FACTORIALS[k];
}

export function scoreMatrix(
  lambdaHome: number,
  lambdaAway: number,
): number[][] {
  const matrix: number[][] = [];
  for (let home = 0; home <= MAX_GOALS; home += 1) {
    const row: number[] = [];
    for (let away = 0; away <= MAX_GOALS; away += 1) {
      row.push(poissonPmf(home, lambdaHome) * poissonPmf(away, lambdaAway));
    }
    matrix.push(row);
  }
  return matrix;
}

function formMultiplier(form: FormResult[]): number {
  if (form.length === 0) return 1;
  const points = form.reduce(
    (total, result) => total + (result === "W" ? 3 : result === "D" ? 1 : 0),
    0,
  );
  const maxPoints = form.length * 3;
  // 0.90 (terrible form) → 1.10 (perfect form)
  return 0.9 + (points / maxPoints) * 0.2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function expectedGoals(match: Match): { home: number; away: number } {
  const homeForm = formMultiplier(match.form.home);
  const awayForm = formMultiplier(match.form.away);

  const home = clamp(
    LEAGUE_AVG_HOME * match.strength.home.attack * match.strength.away.defence * homeForm,
    0.25,
    4.5,
  );
  const away = clamp(
    LEAGUE_AVG_AWAY * match.strength.away.attack * match.strength.home.defence * awayForm,
    0.2,
    4.2,
  );

  return { home: Number(home.toFixed(2)), away: Number(away.toFixed(2)) };
}

export function predictMatch(match: Match): Prediction {
  const { home: lambdaHome, away: lambdaAway } = expectedGoals(match);
  const matrix = scoreMatrix(lambdaHome, lambdaAway);

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over25 = 0;
  let btts = 0;
  const scorelines: { home: number; away: number; probability: number }[] = [];

  for (let home = 0; home <= MAX_GOALS; home += 1) {
    for (let away = 0; away <= MAX_GOALS; away += 1) {
      const p = matrix[home][away];
      if (home > away) homeWin += p;
      else if (home === away) draw += p;
      else awayWin += p;

      if (home + away > 2.5) over25 += p;
      if (home > 0 && away > 0) btts += p;

      scorelines.push({ home, away, probability: p });
    }
  }

  scorelines.sort((a, b) => b.probability - a.probability);

  return {
    homeWin,
    draw,
    awayWin,
    lambdaHome,
    lambdaAway,
    over25,
    btts,
    topScorelines: scorelines.slice(0, 5),
  };
}

/** Fair decimal odds with a bookmaker overround applied. */
export function toDecimalOdds(probability: number): number {
  const safe = Math.max(probability, 0.001);
  return Number((1 / (safe * (1 + BOOKMAKER_MARGIN))).toFixed(2));
}

export function matchOdds(prediction: Prediction) {
  return {
    home: toDecimalOdds(prediction.homeWin),
    draw: toDecimalOdds(prediction.draw),
    away: toDecimalOdds(prediction.awayWin),
    over25: toDecimalOdds(prediction.over25),
    under25: toDecimalOdds(1 - prediction.over25),
    bttsYes: toDecimalOdds(prediction.btts),
    bttsNo: toDecimalOdds(1 - prediction.btts),
  };
}

/** Most likely single scoreline, e.g. "2–1". */
export function likelyScoreline(prediction: Prediction): string {
  const top = prediction.topScorelines[0];
  return `${top.home}–${top.away}`;
}
