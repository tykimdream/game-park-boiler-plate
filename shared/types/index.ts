export type {
  GameStatus,
  FinishReason,
  MatchResult,
  Difficulty,
  GameConfig,
} from './game';
export { DEFAULT_TIME_LIMITS } from './game';

export type {
  QueueJoinPayload,
  QueueLeavePayload,
  GameActionPayload,
  GameForfeitPayload,
  ClientToServerEvents,
  QueueJoinedPayload,
  QueueLeftPayload,
  QueueUpdatePayload,
  MatchFoundPayload,
  GameStartedPayload,
  GameStateUpdatePayload,
  OpponentStateUpdatePayload,
  OpponentFinishedPayload,
  TimerTickPayload,
  GameResultPayload,
  WsErrorPayload,
  ServerToClientEvents,
} from './ws-events';

export type {
  InitPayload,
  ScorePayload,
  GameOverPayload,
  ErrorPayload,
  PlatformToGameMessage,
  GameToPlatformMessage,
} from './message';
