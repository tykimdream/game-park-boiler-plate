import { type Difficulty, type FinishReason, type GameStatus } from '../../../shared/types/game';

interface PlayerState {
  userId: string;
  nickname: string;
  socketId: string;
  gameData: Record<string, unknown>;
  status: GameStatus;
  finishReason: FinishReason;
  startTime: number;
  endTime: number | null;
  score: number;
}

interface Room {
  id: string;
  difficulty: Difficulty;
  players: Map<string, PlayerState>;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}

interface QueueEntry {
  userId: string;
  nickname: string;
  socketId: string;
  joinedAt: number;
}

export type { PlayerState, Room, QueueEntry };
