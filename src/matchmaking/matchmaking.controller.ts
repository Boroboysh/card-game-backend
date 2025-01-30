import { Controller, Post, Body } from '@nestjs/common';
import { addPlayerToQueue, removePlayerFromQueue } from './matchmaking.queue';

@Controller('battle')
export class MatchmakingController {
  @Post('find')
  async findMatch(@Body() playerData: { id: string; mmr: number; ping: number }) {
    await addPlayerToQueue(playerData);
    return { message: 'Searching for a match...' };
  }

  @Post('cancel')
  async cancelSearch(@Body() body: { playerId: string }) {
    await removePlayerFromQueue(body.playerId);
    return { message: 'Search canceled' };
  }
}
