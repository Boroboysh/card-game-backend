import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { EventEmitter } from 'events';
import { MatchmakingSocketEvents } from './types/socket-events.enum';

@Injectable()
@WebSocketGateway({ namespace: '/matchmaking' })
export class MatchmakingGateway extends EventEmitter implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService, private matchmakingService: MatchmakingService) {
    super();
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const playerId = this.getPlayerIdFromSocket(client);

    if (playerId) {
      console.log(`Игрок ${playerId} отключился.`);
      this.matchmakingService.removePlayerFromQueue(playerId);
    }
  }


  @SubscribeMessage(MatchmakingSocketEvents.PingResponse)
  handlePingResponse(@ConnectedSocket() client: Socket) {
    const playerId = this.getPlayerIdFromSocket(client);
    if (playerId) {
      console.log(`Игрок ${playerId} подтвердил, что он в сети.`);
      this.emit(`${MatchmakingSocketEvents.PingResponsePlayer}${playerId}`); // Сообщаем MatchmakingService
    }
  }

  @SubscribeMessage(MatchmakingSocketEvents.QueueDisconnect)
  async handleQueueDisconnect(@ConnectedSocket() client: Socket) {
    const playerId = this.getPlayerIdFromSocket(client);

    if (playerId) {
      await this.matchmakingService.removePlayerFromQueue(playerId);
      console.log(`Игрок ${playerId} откл1ючился — удалён из очереди`);
    }
  }

  private getPlayerIdFromSocket(client: Socket): string | null {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.warn(`WebSocket подключение без токена, отключаем клиента: ${client.id}`);
        client.disconnect()
        return null;
      }

      const payload = this.jwtService.verify(token);

      if (!payload?.sub) {
        console.warn(`WebSocket: токен ${token} не содержит userId (sub).`);
        client.disconnect()
        return null;
      }

      return payload.sub;
    } catch (err) {
      console.error(`Ошибка валидации WebSocket-токена: ${err.message}`);
      client.disconnect()
      return null;
    }
  }


  private getSocketByPlayerId(playerId: string): Socket | undefined {
    if (!this.server) {
      console.warn(`⚠️ WebSocket сервер не существует`);
      return
    }

    if (!this.server.sockets?.sockets) {
      console.warn(`⚠️ Сокеты не существуют.`);
      return
    }

    const sockets = Array.from(this.server.sockets.sockets.values());

    return sockets.find((socket) => this.getPlayerIdFromSocket(socket) === playerId);
  }

  emitMatchFound(battleId: string, players: any[]) {
    // current format battleId - `battle_${player.id}_${opponent.id}`
    this.server.emit(MatchmakingSocketEvents.MatchFound, { battleId, players });
  }

  emitToPlayer(playerId: string, event: string, data?: any) {
    const socket = this.getSocketByPlayerId(playerId);

    if (socket) {
      socket.emit(event, data);
    } else {
      console.log(`⚠️ Не найден сокет для игрока ${playerId}`);
    }
  }
}
