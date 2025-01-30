import { Module, forwardRef } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  controllers: [DecksController],
  providers: [DecksService, PrismaService],
})
export class DecksModule {}
