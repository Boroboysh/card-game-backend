import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { AuthErrorCodes } from '../errors/error-codes';

@Injectable()
@WebSocketGateway({ namespace: '/matchmaking' })
export class MatchmakingGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService, private matchmakingService: MatchmakingService) {}

  emitMatchFound(battleId: string, players: any[]) {
    // curent format battleId - `battle_${player.id}_${opponent.id}`
    this.server.emit('match_found', { battleId, players });
  }

  @SubscribeMessage('queue_disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const playerId = this.getPlayerIdFromSocket(client);
    if (playerId) {
      await this.matchmakingService.removePlayerFromQueue(playerId);
      console.log(`Игрок ${playerId} отключился — удалён из очереди`);
    }
  }

  private getPlayerIdFromSocket(client: Socket): string | null {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return null;
      }

      const payload = this.jwtService.verify(token); // Декодируем JWT
      return payload.sub; // Берём userId из токена
    } catch (err) {
      console.error('Ошибка валидации WebSocket-токена:', AuthErrorCodes.TOKEN_INVALID, err);
      return null;
    }
  }
}
