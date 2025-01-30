import { Module } from '@nestjs/common';
import { MatchmakingGateway } from './matchmaking.gateway';
import { MatchmakingController } from './matchmaking.controller';
import { setMatchmakingGateway } from './matchmaking.worker';

@Module({
  controllers: [MatchmakingController],
  providers: [
    MatchmakingGateway,
    {
      provide: 'GATEWAY_INIT',
      useFactory: (gatewayInstance: MatchmakingGateway) => {
        setMatchmakingGateway(gatewayInstance);
      },
      inject: [MatchmakingGateway],
    },
  ],
  exports: [MatchmakingGateway],
})
export class MatchmakingModule {}
