import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameModule } from '../game/game.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [GameModule, MatchModule],
  providers: [GameGateway],
})
export class WsModule {}
