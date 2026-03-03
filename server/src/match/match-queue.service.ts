import { Injectable } from '@nestjs/common';
import { type Difficulty } from '../../../shared/types/game';
import { type QueueEntry } from '../types/server-types';

@Injectable()
export class MatchQueueService {
  private readonly queues: Map<Difficulty, QueueEntry[]> = new Map([
    ['easy', []],
    ['medium', []],
    ['hard', []],
  ]);

  join = (difficulty: Difficulty, entry: QueueEntry): number => {
    const queue = this.queues.get(difficulty)!;
    queue.push(entry);
    return queue.length - 1;
  };

  leave = (socketId: string): boolean => {
    let removed = false;
    for (const [, queue] of this.queues) {
      const index = queue.findIndex((entry) => entry.socketId === socketId);
      if (index !== -1) {
        queue.splice(index, 1);
        removed = true;
      }
    }
    return removed;
  };

  tryMatch = (difficulty: Difficulty): [QueueEntry, QueueEntry] | null => {
    const queue = this.queues.get(difficulty)!;
    if (queue.length < 2) {
      return null;
    }
    const player1 = queue.shift()!;
    const player2 = queue.shift()!;
    return [player1, player2];
  };

  getPosition = (socketId: string): number => {
    for (const [, queue] of this.queues) {
      const index = queue.findIndex((entry) => entry.socketId === socketId);
      if (index !== -1) {
        return index;
      }
    }
    return -1;
  };

  getDifficultyBySocketId = (socketId: string): Difficulty | null => {
    for (const [difficulty, queue] of this.queues) {
      if (queue.some((entry) => entry.socketId === socketId)) {
        return difficulty;
      }
    }
    return null;
  };

  getWaitingSocketIds = (difficulty: Difficulty): string[] => {
    const queue = this.queues.get(difficulty);
    if (!queue) {
      return [];
    }
    return queue.map((entry) => entry.socketId);
  };

  getQueueSize = (difficulty: Difficulty): number => {
    return this.queues.get(difficulty)!.length;
  };
}
