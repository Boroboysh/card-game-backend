export const MATCHMAKING_THRESHOLD = 80; // Минимальный score для матча
export const MMR_STEP = 200; // Шаг группировки MMR (размер диапазона)

// Начальные "веса" критериев
export const INITIAL_WEIGHTS = {
  mmr: 40,
  ping: 20,
  winRate: 20,
  playStyle: 10,
  history: 5,
  timing: 5,
  reports: -10, // Отрицательное значение снижает score
};

// Адаптация критериев при ожидании
export const SEARCH_TIME_UPDATES = [
  { time: 10, mmrRangeIncrease: 5, mmrChange: -5, pingChange: +5, winRateChange: +3 },
  { time: 20, mmrRangeIncrease: 10, mmrChange: -10, pingChange: +10, winRateChange: +5 },
  { time: 30, mmrRangeIncrease: 15, playStyle: 10, history: 5 },
  { time: 45, history: 10, timing: 5 },
];

// Штрафы
export const PENALTIES = {
  playStyleMismatch: 15, // Разные стили игры
  matchHistoryPenalty: 10, // Игроки играли недавно
  reportPenaltyFactor: 2, // Умножаем количество репортов
};
