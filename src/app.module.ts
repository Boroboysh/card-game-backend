import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { DecksModule } from './decks/decks.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CardsModule,
    DecksModule,
    MatchmakingModule
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
