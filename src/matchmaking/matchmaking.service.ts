import { redisClient } from '../config/redis.config';
import { UsersService } from '../users/users.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CustomErrorException } from '../errors/custom-error.exception';
import { PlayerErrorCodes } from '../errors/error-codes';
import { MMR_STEP } from './matchmaking.constants';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingSocketEvents } from './types/socket-events.enum';
import { MatchmakingRedisKeys } from './types/redis-keys.enum';

@Injectable()
export class MatchmakingService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => MatchmakingGateway)) private readonly gateway: MatchmakingGateway
  ) {}

  async addPlayerToQueue(playerId: string): Promise<void> {
    try {
      // Получаем данные игрока из базы данных
      const player = await this.usersService.findById(playerId);

      if (!player) {
        throw new CustomErrorException(PlayerErrorCodes.USER_NOT_FOUND, 'Player not found', 400);
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

      // Определяем, в какой диапазон MMR попадает игрок
      // Например, если MMR = 1150, то он попадёт в диапазон 1000–1199 (matchmaking:mmr:1000)
      const mmrRange = Math.floor(playerData.mmr / MMR_STEP) * MMR_STEP;
      const queueKey = `${MatchmakingRedisKeys.MATCHMAKING_MMR}${mmrRange}`;

      const isInQueue = await this.isPlayerInQueue(queueKey, playerId);

      if (isInQueue) {
        throw new CustomErrorException(PlayerErrorCodes.ALREADY_IN_QUEUE, 'Player is already in the matchmaking queue', 400);
      }

      await redisClient.zAdd(queueKey, { score: playerData.mmr, value: JSON.stringify(playerData) });

      // Отправляем событие в Redis → триггерит матчмейкинг!
      await redisClient.publish(MatchmakingRedisKeys.MATCHMAKING_NEW_PLAYER, JSON.stringify(playerData));
    } catch (error) {
      console.error('Error adding player to queue:', error);
      throw error;
    }
  }

  async removePlayerFromQueue(playerId: string): Promise<void> {
    const queues = await redisClient.keys(`${MatchmakingRedisKeys.MATCHMAKING_MMR}*`); // Все очереди

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

  async isPlayerInQueue(queueKey: string, playerId: string): Promise<boolean> {
    const existingPlayers = await redisClient.zRange(queueKey, 0, -1);

    return existingPlayers.some((entry) => {
      const storedPlayer = JSON.parse(entry);
      return storedPlayer.id === playerId;
    });
  }

  async checkOfflinePlayers(player1: string, player2: string): Promise<string[]> {
    return new Promise((resolve) => {
      const playersConfirmed = new Set<string>();

      // Таймер отмены пинга через 5 секунд
      const timeout = setTimeout(() => {
        console.log(`Проверка пинга истекла`);

        const afkPlayers: string[] = [];

        if (!playersConfirmed.has(player1)) {
          afkPlayers.push(player1);
          console.log(`❌ Игрок ${player1} не ответил на пинг (AFK)`);
        }
        if (!playersConfirmed.has(player2)) {
          afkPlayers.push(player2);
          console.log(`❌ Игрок ${player2} не ответил на пинг (AFK)`);
        }

        resolve(afkPlayers); // Возвращаем список AFK-игроков
      }, 5000);

      // Функция подтверждения игрока
      const confirmPlayer = (playerId: string) => {
        playersConfirmed.add(playerId);
        if (playersConfirmed.size === 2) {
          clearTimeout(timeout);
          resolve([]); // Оба игрока ответили, возвращаем пустой массив
        }
      };

      // Подписываемся на ответы от игроков
      // todo Не очень читаемо
      this.gateway.once(`${MatchmakingSocketEvents.PingResponsePlayer}${player1}`, () => confirmPlayer(player1));
      this.gateway.once(`${MatchmakingSocketEvents.PingResponsePlayer}${player2}`, () => confirmPlayer(player2));

      // Отправляем ping обоим игрокам
      this.gateway.emitToPlayer(player1, MatchmakingSocketEvents.MatchPing);
      this.gateway.emitToPlayer(player2, MatchmakingSocketEvents.MatchPing);

      console.log(`📡 Отправлен ping игрокам ${player1} и ${player2}`);
    });
  }

}