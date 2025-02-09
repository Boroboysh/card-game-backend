import { forwardRef, Module } from '@nestjs/common';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingController } from './matchmaking.controller';
import { setMatchmakingGateway, setMatchmakingService } from './matchmaking.worker';
import { AuthModule } from '../auth/auth.module';
import { MatchmakingService } from './matchmaking.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, forwardRef(() => UsersModule)],
  controllers: [MatchmakingController],
  providers: [
    MatchmakingGateway,
    MatchmakingService,
    {
      provide: 'GATEWAY_INIT',
      useFactory: (gatewayInstance: MatchmakingGateway, matchmakingService: MatchmakingService) => {
        setMatchmakingGateway(gatewayInstance);
        setMatchmakingService(matchmakingService);
      },
      inject: [MatchmakingGateway, MatchmakingService],
    },
  ],
  exports: [MatchmakingGateway, MatchmakingService],
})
export class MatchmakingModule {}
