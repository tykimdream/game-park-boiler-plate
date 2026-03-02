export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type FinishReason = 'none' | 'cleared' | 'died' | 'timeout' | 'forfeit';

export interface GameConfig {
  timeLimit: number;
}
