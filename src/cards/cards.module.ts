import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CardsController],
  providers: [CardsService, PrismaService],
  exports: [CardsService],
})
export class CardsModule {}
