import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CustomErrorException } from '../errors/custom-error.exception';
import { CardErrorCodes } from '../errors/error-codes';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async createCard(name: string, attack: number, defense: number, type: string, rarity: string, cost: number) {
    return this.prisma.card.create({
      data: { name, attack, defense, type, rarity, cost }
    });
  }

  async getAllCards() {
    return this.prisma.card.findMany();
  }

  async getCardById(id: string) {
    const card = await this.prisma.card.findUnique({ where: { id } });

    if (!card) {
      throw new CustomErrorException(CardErrorCodes.NOT_FOUND, 'Card not found', 404);
    }

    return card;
  }

  async updateCard(id: string, data: { name?: string; attack?: number; defense?: number; type?: string }) {
    return this.prisma.card.update({
      where: { id },
      data,
    });
  }

  async deleteCard(id: string) {
    return this.prisma.card.delete({ where: { id } });
  }

  async getCardsByFilter(type?: string, rarity?: string) {
    return this.prisma.card.findMany({
      where: {
        type: type ? type : undefined,
        rarity: rarity ? rarity : undefined,
      },
    });
  }
}
