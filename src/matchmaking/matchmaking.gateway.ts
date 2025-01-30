import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { removePlayerFromQueue } from './matchmaking.queue';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: true })
export class MatchmakingGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  emitMatchFound(battleId: string, players: any[]) {
    this.server.emit('match_found', { battleId, players });
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const playerId = this.getPlayerIdFromSocket(client);
    if (playerId) {
      await removePlayerFromQueue(playerId);
      console.log(`❌ Игрок ${playerId} отключился — удалён из очереди`);
    }
  }

  private getPlayerIdFromSocket(client: Socket): string | null {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) return null;

      const payload = this.jwtService.verify(token); // Декодируем JWT
      return payload.sub; // Берём userId из токена
    } catch (err) {
      console.error('Ошибка валидации WebSocket-токена:', err);
      return null;
    }
  }
}
