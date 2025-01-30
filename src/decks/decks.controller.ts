import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { DecksService } from './decks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { sub: string };
}

@Controller('decks')
@UseGuards(JwtAuthGuard) // ✅ Защищаем API колод JWT-аутентификацией
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  async createDeck(@Req() req: AuthenticatedRequest, @Body() body: { name: string; cardIds: string[] }) {
    if (!req.user || !req.user.sub) {
      throw new Error('User ID not found in request'); // ✅ Логируем ошибку
    }
    return this.decksService.createDeck(req.user.sub, body.name, body.cardIds);
  }

  @Get()
  async getUserDecks(@Req() req: AuthenticatedRequest) {
    if (!req.user || !req.user.sub) {
      throw new Error('User ID not found in request'); // ✅ Логируем ошибку
    }
    return this.decksService.getUserDecks(req.user.sub);
  }
}
