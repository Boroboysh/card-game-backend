import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CustomErrorException } from '../errors/custom-error.exception';
import { PlayerErrorCodes, DeckErrorCodes } from '../errors/error-codes';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(username: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { username } });

    if (existingUser) {
      throw new CustomErrorException(PlayerErrorCodes.USERNAME_TAKEN, 'Username is already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async setActiveDeck(userId: string, deckId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeDeck: deckId },
    });
  }

  async getActiveDeck(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeDeck: true },
    });
    if (!user || !user.activeDeck) {
      throw new CustomErrorException(DeckErrorCodes.NOT_FOUND, 'Active deck not found');
    }
    return user.activeDeck;
  }
}
