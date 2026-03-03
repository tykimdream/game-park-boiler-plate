import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { ScoringService } from './scoring.service';

@Module({
  providers: [GameService, ScoringService],
  exports: [GameService, ScoringService],
})
export class GameModule {}
