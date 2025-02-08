import { Module } from '@nestjs/common';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingController } from './matchmaking.controller';
import { setMatchmakingGateway, setMatchmakingService } from './matchmaking.worker';
import { AuthModule } from '../auth/auth.module';
import { MatchmakingService } from './matchmaking.service';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [MatchmakingController],
  providers: [
    MatchmakingGateway,
    MatchmakingService,
    {
      provide: 'GATEWAY_INIT',
      useFactory: (gatewayInstance: MatchmakingGateway, matchmakingService: MatchmakingService) => {
        setMatchmakingGateway(gatewayInstance);
        setMatchmakingService(matchmakingService)
      },
      inject: [MatchmakingGateway, MatchmakingService],
    },
  ],
  imports: [AuthModule, UsersModule],
  exports: [MatchmakingGateway],
})
export class MatchmakingModule {}
