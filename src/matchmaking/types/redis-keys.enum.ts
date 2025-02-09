export enum MatchmakingRedisKeys {
  /** Очередь матчмейкинга по MMR */
  MATCHMAKING_MMR = 'matchmaking:mmr:',

  /** Событие нового игрока в очереди */
  MATCHMAKING_NEW_PLAYER = 'matchmaking:new_player',
}