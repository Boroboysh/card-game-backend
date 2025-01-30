import { redisClient } from '../config/redis.config';

export async function addPlayerToQueue(playerData) {
  // Перед добавлением в очередь - сначала очищаем старые записи!
  await removePlayerFromQueue(playerData.id);

  const mmrRange = Math.floor(playerData.mmr / 200) * 200;
  const queueKey = `matchmaking:mmr:${mmrRange}`;

  await redisClient.zAdd(queueKey, { score: playerData.mmr, value: JSON.stringify(playerData) });

  // Отправляем событие в Redis → триггерит матчмейкинг!
  await redisClient.publish('matchmaking:new_player', JSON.stringify(playerData));
}


export async function removePlayerFromQueue(playerId: string) {
  const queues = await redisClient.keys('matchmaking:mmr:*'); // Все очереди
  for (const queueKey of queues) {
    const players = await redisClient.zRange(queueKey, 0, -1);
    for (const playerData of players) {
      const player = JSON.parse(playerData);
      if (player.id === playerId) {
        await redisClient.zRem(queueKey, playerData);
        return;
      }
    }
  }
}
