import { type GameStatus } from './game';

export interface QueueJoinPayload {
  userId: string;
  nickname: string;
}

export interface QueueLeavePayload {
  userId: string;
}

export interface QueueJoinedPayload {
  position: number;
}

export interface QueueLeftPayload {
  userId: string;
}

export interface MatchFoundPayload {
  matchId: string;
  opponent: { userId: string; nickname: string };
  countdown: number;
}

export interface GameStartedPayload {
  matchId: string;
}

export interface GameResultPayload {
  result: 'win' | 'lose' | 'draw';
  score: number;
  opponentScore: number;
}

export interface TimerTickPayload {
  elapsedTime: number;
}

export interface WsErrorPayload {
  code: string;
  message: string;
}

export interface ClientToServerEvents {
  'queue:join': (payload: QueueJoinPayload) => void;
  'queue:leave': (payload: QueueLeavePayload) => void;
  'game:forfeit': (payload: { matchId: string }) => void;
}

export interface ServerToClientEvents {
  'queue:joined': (payload: QueueJoinedPayload) => void;
  'queue:left': (payload: QueueLeftPayload) => void;
  'match:found': (payload: MatchFoundPayload) => void;
  'game:started': (payload: GameStartedPayload) => void;
  'game:result': (payload: GameResultPayload) => void;
  'game:timer-tick': (payload: TimerTickPayload) => void;
  error: (payload: WsErrorPayload) => void;
}
