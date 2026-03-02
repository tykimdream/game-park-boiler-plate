interface InitPayload {
  userId: string | null;
  nickname: string;
  gameId: string;
}

interface ScorePayload {
  userId: string | null;
  gameId: string;
  score: number;
}

interface GameOverPayload {
  userId: string | null;
  gameId: string;
  score: number;
  playtime: number;
}

interface ErrorPayload {
  code: string;
  message: string;
}

export type PlatformToGameMessage =
  | { type: 'INIT'; payload: InitPayload }
  | { type: 'PAUSE'; payload: Record<string, never> }
  | { type: 'RESUME'; payload: Record<string, never> }
  | { type: 'TERMINATE'; payload: Record<string, never> };

export type GameToPlatformMessage =
  | { type: 'READY'; payload: Record<string, never> }
  | { type: 'SCORE'; payload: ScorePayload }
  | { type: 'GAME_OVER'; payload: GameOverPayload }
  | { type: 'ERROR'; payload: ErrorPayload };

export type { InitPayload, ScorePayload, GameOverPayload, ErrorPayload };
