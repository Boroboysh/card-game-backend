import { Controller, Post, Body } from '@nestjs/common';
import { CustomErrorException } from '../errors/custom-error.exception';
import { GameErrorCodes } from '../errors/error-codes';
import { MatchmakingPlayerData } from '../types/matchmaking';
import { MatchmakingService } from './matchmaking.service';

@Controller('battle')
export class MatchmakingController {
  constructor(private matchmakingService: MatchmakingService) {}

  @Post('find')
  async findMatch(@Body() playerData: MatchmakingPlayerData) {
    if (!playerData || playerData.id === undefined) {
      throw new CustomErrorException(GameErrorCodes.INVALID_MATCHMAKING_DATA, 'Invalid matchmaking data', 400);
    }

    await this.matchmakingService.addPlayerToQueue(playerData.id);

    return { message: 'Searching for a match...' };
  }

  @Post('cancel')
  async cancelSearch(@Body() playerData: MatchmakingPlayerData) {
    if (!playerData || playerData.id === undefined) {
      throw new CustomErrorException(GameErrorCodes.INVALID_MATCHMAKING_DATA, 'Invalid matchmaking data', 400);
    }

    await this.matchmakingService.removePlayerFromQueue(playerData.id);
    return { message: 'Search canceled' };
  }
}
