import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Difficulty,
  type MatchFoundPayload,
  type GameResultPayload,
  type GameStartedPayload,
  type QueueUpdatePayload,
} from '../../../shared/types';
import { type MatchResultState } from '../types';
import { type TypedSocket } from '../lib/socket-client';
import { COUNTDOWN_SECONDS, MATCH_TIMEOUT_MS } from '../constants';

type MatchPhase = 'idle' | 'matching' | 'countdown' | 'playing' | 'result';

interface MatchInfo {
  roomId: string;
  opponentNickname: string;
  difficulty: Difficulty;
}

interface QueueInfo {
  queueSize: number;
  estimatedWait: number;
}

interface UseMatchReturn {
  phase: MatchPhase;
  matchInfo: MatchInfo | null;
  matchResult: MatchResultState | null;
  countdown: number;
  queueInfo: QueueInfo;
  joinQueue: (difficulty: Difficulty) => void;
  leaveQueue: () => void;
  reset: () => void;
}

const useMatch = (socket: TypedSocket | null): UseMatchReturn => {
  const [phase, setPhase] = useState<MatchPhase>('idle');
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultState | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [queueInfo, setQueueInfo] = useState<QueueInfo>({
    queueSize: 0,
    estimatedWait: 30,
  });
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generationRef = useRef(0);

  const clearCountdownTimer = useCallback(() => {
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const clearMatchTimeout = useCallback(() => {
    if (matchTimeoutRef.current !== null) {
      clearTimeout(matchTimeoutRef.current);
      matchTimeoutRef.current = null;
    }
  }, []);

  const resetToIdle = useCallback(() => {
    clearCountdownTimer();
    clearMatchTimeout();
    setPhase('idle');
    setMatchInfo(null);
    setCountdown(COUNTDOWN_SECONDS);
  }, [clearCountdownTimer, clearMatchTimeout]);

  const joinQueue = useCallback(
    (difficulty: Difficulty) => {
      if (!socket) {
        return;
      }
      generationRef.current += 1;
      clearMatchTimeout();
      clearCountdownTimer();
      setMatchInfo(null);
      setPhase('matching');

      socket.emit('queue:join', { difficulty });

      const gen = generationRef.current;
      matchTimeoutRef.current = setTimeout(() => {
        if (generationRef.current === gen) {
          socket.emit('queue:leave', {});
          resetToIdle();
        }
      }, MATCH_TIMEOUT_MS);
    },
    [socket, clearMatchTimeout, clearCountdownTimer, resetToIdle],
  );

  const leaveQueue = useCallback(() => {
    if (!socket) {
      return;
    }
    resetToIdle();
    generationRef.current += 1;
    socket.emit('queue:leave', {});
  }, [socket, resetToIdle]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    resetToIdle();
    setMatchResult(null);
  }, [resetToIdle]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleQueueJoined = () => {
      setPhase((prev) => (prev === 'idle' ? 'matching' : prev));
    };

    const handleQueueLeft = () => {
      setPhase((prev) => (prev === 'matching' ? prev : 'idle'));
    };

    const handleMatchFound = (payload: MatchFoundPayload) => {
      clearMatchTimeout();
      setMatchInfo({
        roomId: payload.roomId,
        opponentNickname: payload.opponent.nickname,
        difficulty: payload.difficulty,
      });
    };

    const handleGameStarted = (payload: GameStartedPayload) => {
      setPhase('countdown');
      setCountdown(payload.countdown);

      clearCountdownTimer();
      let remaining = payload.countdown;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearCountdownTimer();
          setPhase('playing');
        }
      }, 1000);
    };

    const handleGameResult = (payload: GameResultPayload) => {
      clearCountdownTimer();
      clearMatchTimeout();
      setPhase('result');
      setMatchResult({
        result: payload.result,
        myScore: payload.myScore,
        opponentScore: payload.opponentScore,
        myTime: payload.myTime,
        opponentTime: payload.opponentTime,
        reason: payload.reason,
        opponentReason: payload.opponentReason,
      });
    };

    const handleQueueUpdate = (payload: QueueUpdatePayload) => {
      setQueueInfo({
        queueSize: payload.queueSize,
        estimatedWait: payload.estimatedWaitSeconds,
      });
    };

    const handleDisconnect = () => {
      resetToIdle();
      generationRef.current += 1;
    };

    const handleError = () => {
      setPhase((prev) => {
        if (prev === 'matching' || prev === 'countdown') {
          return 'idle';
        }
        return prev;
      });
      clearCountdownTimer();
      clearMatchTimeout();
    };

    socket.on('queue:joined', handleQueueJoined);
    socket.on('queue:left', handleQueueLeft);
    socket.on('queue:update', handleQueueUpdate);
    socket.on('match:found', handleMatchFound);
    socket.on('game:started', handleGameStarted);
    socket.on('game:result', handleGameResult);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('queue:joined', handleQueueJoined);
      socket.off('queue:left', handleQueueLeft);
      socket.off('queue:update', handleQueueUpdate);
      socket.off('match:found', handleMatchFound);
      socket.off('game:started', handleGameStarted);
      socket.off('game:result', handleGameResult);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      clearCountdownTimer();
      clearMatchTimeout();
    };
  }, [socket, clearCountdownTimer, clearMatchTimeout, resetToIdle]);

  return { phase, matchInfo, matchResult, countdown, queueInfo, joinQueue, leaveQueue, reset };
};

export { useMatch };
export type { MatchPhase, MatchInfo };
