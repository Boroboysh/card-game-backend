import { redisClient } from '../config/redis.config';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import { CustomErrorException } from '../errors/custom-error.exception';
import { AuthErrorCodes } from '../errors/error-codes';

@Injectable()
export class MatchmakingService {
  constructor(private readonly usersService: UsersService) {}

  async addPlayerToQueue(playerId: string): Promise<void> {
    try {
      // Получаем данные игрока из базы данных
      const player = await this.usersService.findById(playerId);

      if (!player) {
        throw new CustomErrorException(AuthErrorCodes.USER_NOT_FOUND, 'Player not found', 400);
      }

      // Преобразуем данные игрока в формат MatchmakingPlayerData
      const playerData = {
        id: player.id,
        mmr: player.mmr,
        ping: player.ping,
        winRate: player.winRate,
        playStyle: player.playStyle,
        reports: player.reports,
        matchHistory: player.matchHistory,
      };

      console.log(playerData);

      // Перед добавлением в очередь - сначала очищаем старые записи!
      await this.removePlayerFromQueue(playerId);

      const mmrRange = Math.floor(playerData.mmr / 200) * 200;
      const queueKey = `matchmaking:mmr:${mmrRange}`;

      await redisClient.zAdd(queueKey, { score: playerData.mmr, value: JSON.stringify(playerData) });

      // Отправляем событие в Redis → триггерит матчмейкинг!
      await redisClient.publish('matchmaking:new_player', JSON.stringify(playerData));
    } catch (error) {
      console.error('Error adding player to queue:', error);
      throw error;
    }
  }

  async removePlayerFromQueue(playerId: string): Promise<void> {
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
}