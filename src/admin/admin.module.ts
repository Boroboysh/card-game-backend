import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminCardsController } from './admin-cards.controller';
import { CardsService } from '../cards/cards.service';
import { PrismaService } from '../prisma.service';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';

@Module({
  controllers: [AdminAuthController, AdminCardsController],
  providers: [AdminAuthService, CardsService, PrismaService, AdminJwtAuthGuard],
})
export class AdminModule {}
