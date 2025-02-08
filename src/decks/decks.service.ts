import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CustomErrorException } from '../errors/custom-error.exception';
import { DeckErrorCodes } from '../errors/error-codes';

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {
  }

  async createDeck(userId: string, name: string, cardIds: string[]) {
    // Проверяем, сколько колод у пользователя
    const deckCount = await this.prisma.deck.count({
      where: { userId },
    });

    if (deckCount >= 10) {
      throw new CustomErrorException(DeckErrorCodes.LIMIT_REACHED, 'You cannot have more than 10 decks.');
    }

    return this.prisma.deck.create({
      data: {
        name,
        userId,
        cards: {
          create: cardIds.map(cardId => ({
            card: { connect: { id: cardId } }
          })),
        },
      },
    });
  }

  async getUserDecks(userId: string) {
    return this.prisma.deck.findMany({
      where: { userId },
      include: { cards: true },
    });
  }

  async deleteDeck(id: string) {
    return this.prisma.deck.delete({ where: { id } });
  }
}
