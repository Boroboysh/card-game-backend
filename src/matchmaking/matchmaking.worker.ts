import { redisClient } from '../config/redis.config';
import { calculateMatchScore } from './matchmaking.utils';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MATCHMAKING_THRESHOLD } from './matchmaking.constants';
import { MatchmakingService } from './matchmaking.service';

let gateway: MatchmakingGateway;
let matchmakingService: MatchmakingService;

export function setMatchmakingGateway(instance: MatchmakingGateway) {
  gateway = instance;
}

export function setMatchmakingService(instance: MatchmakingService) {
  matchmakingService = instance;
}

const subscriber = redisClient.duplicate();

async function findMatchForPlayer(player) {
  let mmrRange = Math.floor(player.mmr / 200) * 200;
  let queueKey = `matchmaking:mmr:${mmrRange}`;

  let candidates = await redisClient.zRange(queueKey, 0, -1);

  if (candidates.length === 0) {
    // Расширяем поиск, если кандидатов нет (ищем в соседних MMR-диапазонах)
    mmrRange += 200;
    queueKey = `matchmaking:mmr:${mmrRange}`;

    // { withScores: true }
    candidates = await redisClient.zRange(queueKey, 0, -1);
  }

  for (const candidate of candidates) {
    const opponent = JSON.parse(candidate);

    if (opponent.id === player.id) {
      continue;
    }

    const searchTime = (Date.now() - player.joinedAt) / 1000;
    const score = calculateMatchScore(player, opponent, searchTime);

    console.log('score', score);

    if (score > MATCHMAKING_THRESHOLD) {
      const battleId = `battle_${player.id}_${opponent.id}`;

      await matchmakingService.removePlayerFromQueue(player.id);
      await matchmakingService.removePlayerFromQueue(opponent.id);

      gateway.emitMatchFound(battleId, [player, opponent]);

      console.log(`🎯 Match found: ${battleId}`);
      return;
    }
  }
}


async function startWorker() {
  await subscriber.connect();
  await subscriber.subscribe('matchmaking:new_player', async (message) => {
    const player = JSON.parse(message);
    console.log(`🔔 Новый игрок в матчмейкинге: ${player.id}`);
    await findMatchForPlayer(player);
  });
}

startWorker().catch(console.error);
