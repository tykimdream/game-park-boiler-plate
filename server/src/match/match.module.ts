import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchQueueService } from './match-queue.service';

@Module({
  providers: [MatchService, MatchQueueService],
  exports: [MatchService, MatchQueueService],
})
export class MatchModule {}
