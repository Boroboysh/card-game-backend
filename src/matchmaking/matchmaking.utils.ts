import { INITIAL_WEIGHTS, SEARCH_TIME_UPDATES, PENALTIES } from './matchmaking.constants';

export function calculateMatchScore(playerA: any, playerB: any, searchTime: number): number {
  const weights = { ...INITIAL_WEIGHTS };

  // Адаптируем параметры поиска при долгом ожидании
  for (const update of SEARCH_TIME_UPDATES) {
    if (searchTime >= update.time) {
      if (update.mmrRangeIncrease) {
        playerA.mmrRange += update.mmrRangeIncrease;
        playerB.mmrRange += update.mmrRangeIncrease;
      }
      Object.assign(weights, update);
    }
  }

  // Расчёт разницы параметров
  const mmrDiff = Math.abs(playerA.mmr - playerB.mmr);
  const pingDiff = Math.abs(playerA.ping - playerB.ping);
  const winRateDiff = Math.abs(playerA.winRate - playerB.winRate);
  const playStyleDiff = playerA.playStyle === playerB.playStyle ? 0 : PENALTIES.playStyleMismatch;
  const historyPenalty = playerA.matchHistory.includes(playerB.id) ? PENALTIES.matchHistoryPenalty : 0;
  const reportPenalty = playerB.reports * PENALTIES.reportPenaltyFactor;

  const score =
    100 -
    (mmrDiff * (100 - weights.mmr)) / 100 -
    (pingDiff * (100 - weights.ping)) / 100 -
    (winRateDiff * (100 - weights.winRate)) / 100 -
    playStyleDiff -
    historyPenalty -
    reportPenalty;

  return Math.max(0, score);
}
