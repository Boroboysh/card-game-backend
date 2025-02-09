import { redisClient } from '../config/redis.config';
import { calculateMatchScore } from './matchmaking.utils';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MATCHMAKING_THRESHOLD, MMR_STEP } from './matchmaking.constants';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingRedisKeys } from './types/redis-keys.enum';

let gateway: MatchmakingGateway;
let matchmakingService: MatchmakingService;

export function setMatchmakingGateway(instance: MatchmakingGateway) {
  gateway = instance;
}

export function setMatchmakingService(instance: MatchmakingService) {
  matchmakingService = instance;
}

const subscriber = redisClient.duplicate();

//todo player type
async function findMatchForPlayer(player) {
  let mmrRange = Math.floor(player.mmr / MMR_STEP) * MMR_STEP;
  let queueKey = `${MatchmakingRedisKeys.MATCHMAKING_MMR}${mmrRange}`;

  let candidates = await redisClient.zRange(queueKey, 0, -1);

  if (candidates.length === 0) {
    // Расширяем поиск, если кандидатов нет (ищем в соседних MMR-диапазонах)
    mmrRange += MMR_STEP;
    queueKey = `${MatchmakingRedisKeys.MATCHMAKING_MMR}${mmrRange}`;

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

      const inactivePlayers = await matchmakingService.checkOfflinePlayers(player.id, opponent.id);

      if (inactivePlayers.length === 0) {
        // Оба игрока подтвердили активность → удаляем из очереди и запускаем матч
        await matchmakingService.removePlayerFromQueue(player.id);
        await matchmakingService.removePlayerFromQueue(opponent.id);

        gateway.emitMatchFound(battleId, [player, opponent]);

        console.log(`🎯 Match found: ${battleId}`);
      }  else {
        console.log(`Один или оба игрока offline, матч отменён`);

        // Удаляем AFK-игроков из очереди
        for (const afkPlayer of inactivePlayers) {
          await matchmakingService.removePlayerFromQueue(afkPlayer);
        }
      }
    }
  }
}


async function startWorker() {
  await subscriber.connect();
  await subscriber.subscribe(MatchmakingRedisKeys.MATCHMAKING_NEW_PLAYER, async (message) => {
    const player = JSON.parse(message);
    console.log(`🔔 Новый игрок в матчмейкинге: ${player.id}`);
    await findMatchForPlayer(player);
  });
}

startWorker().catch(console.error);
