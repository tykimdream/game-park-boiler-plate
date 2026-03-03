import { type Difficulty, type FinishReason, type GameStatus, type MatchResult } from '../../../shared/types';

export type AppPhase =
  | 'init'
  | 'lobby'
  | 'solo-play'
  | 'matching'
  | 'countdown'
  | 'multi-play'
  | 'result';

export interface SoloGameState {
  status: GameStatus;
  difficulty: Difficulty;
  elapsedTime: number;
  score: number;
  startTime: number | null;
  gameData: Record<string, unknown>;
}

export interface MultiGameState {
  roomId: string;
  difficulty: Difficulty;
  opponentNickname: string;
  myState: unknown;
  opponentState: unknown;
  myElapsedTime: number;
  opponentElapsedTime: number;
  countdown: number;
}

export interface MatchResultState {
  result: MatchResult;
  myScore: number;
  opponentScore: number;
  myTime: number;
  opponentTime: number;
  reason: FinishReason;
  opponentReason: FinishReason;
}
