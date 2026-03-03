import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../game/game.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [AuthModule, GameModule, MatchModule],
  providers: [GameGateway],
})
export class WsModule {}
