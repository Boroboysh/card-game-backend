import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { DecksModule } from './decks/decks.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CardsModule,
    DecksModule
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
