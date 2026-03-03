import { type Difficulty, type FinishReason, type MatchResult } from './game';

// --- Client → Server events ---

export interface QueueJoinPayload {
  difficulty: Difficulty;
}

export interface QueueLeavePayload {}

export interface GameActionPayload {
  type: string;
  [key: string]: unknown;
}

export interface GameForfeitPayload {}

export interface ClientToServerEvents {
  'queue:join': (payload: QueueJoinPayload) => void;
  'queue:leave': (payload: QueueLeavePayload) => void;
  'game:action': (payload: GameActionPayload) => void;
  'game:forfeit': (payload: GameForfeitPayload) => void;
}

// --- Server → Client events ---

export interface QueueJoinedPayload {
  difficulty: Difficulty;
  position: number;
}

export interface QueueLeftPayload {}

export interface QueueUpdatePayload {
  difficulty: Difficulty;
  queueSize: number;
  estimatedWaitSeconds: number;
}

export interface MatchFoundPayload {
  roomId: string;
  opponent: { nickname: string };
  difficulty: Difficulty;
}

export interface GameStartedPayload {
  countdown: number;
}

export interface GameStateUpdatePayload {
  state: unknown;
  elapsedTime: number;
}

export interface OpponentStateUpdatePayload {
  state: unknown;
  elapsedTime: number;
}

export interface OpponentFinishedPayload {
  status: 'won' | 'lost';
  time: number;
}

export interface TimerTickPayload {
  myTime: number;
  opponentTime: number;
}

export interface GameResultPayload {
  result: MatchResult;
  myScore: number;
  opponentScore: number;
  myTime: number;
  opponentTime: number;
  reason: FinishReason;
  opponentReason: FinishReason;
}

export interface WsErrorPayload {
  code: string;
  message: string;
}

export interface ServerToClientEvents {
  'queue:joined': (payload: QueueJoinedPayload) => void;
  'queue:left': (payload: QueueLeftPayload) => void;
  'queue:update': (payload: QueueUpdatePayload) => void;
  'match:found': (payload: MatchFoundPayload) => void;
  'game:started': (payload: GameStartedPayload) => void;
  'game:state-update': (payload: GameStateUpdatePayload) => void;
  'game:opponent-state-update': (payload: OpponentStateUpdatePayload) => void;
  'game:opponent-finished': (payload: OpponentFinishedPayload) => void;
  'game:result': (payload: GameResultPayload) => void;
  'game:timer-tick': (payload: TimerTickPayload) => void;
  error: (payload: WsErrorPayload) => void;
}
