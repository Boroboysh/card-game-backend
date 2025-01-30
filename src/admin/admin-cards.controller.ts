import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CardsService } from '../cards/cards.service';
import { AdminGuard } from './admin.guard';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';

@Controller('admin/cards')
@UseGuards(AdminJwtAuthGuard, AdminGuard)
export class AdminCardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async createCard(
    @Body() body: { name: string; attack: number; defense: number; type: string; rarity: string; cost: number }
  ) {
    return this.cardsService.createCard(body.name, body.attack, body.defense, body.type, body.rarity, body.cost);
  }

  @Put(':id')
  async updateCard(@Param('id') id: string, @Body() body: { name?: string; attack?: number; defense?: number }) {
    return this.cardsService.updateCard(id, body);
  }

  @Delete(':id')
  async deleteCard(@Param('id') id: string) {
    return this.cardsService.deleteCard(id);
  }
}
