export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type FinishReason = 'none' | 'cleared' | 'died' | 'survived' | 'timeout' | 'forfeit';

export type MatchResult = 'win' | 'lose' | 'draw';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  timeLimit: number;
}

export const DEFAULT_TIME_LIMITS: Record<Difficulty, number> = {
  easy: 180,
  medium: 480,
  hard: 900,
};
