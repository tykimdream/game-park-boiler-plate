import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WsModule } from './ws/ws.module';
import { GameModule } from './game/game.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [AuthModule, WsModule, GameModule, MatchModule],
})
export class AppModule {}
