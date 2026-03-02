import { Module } from '@nestjs/common';
import { WsModule } from './ws/ws.module';
import { GameModule } from './game/game.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [WsModule, GameModule, MatchModule],
})
export class AppModule {}
