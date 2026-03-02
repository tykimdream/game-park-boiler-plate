import { useCallback, useRef, useState } from 'react';
import { type FinishReason, type GameStatus } from '../../../shared/types/game';
import { TIMER_INTERVAL_MS } from '../constants';

interface UseSoloGameOptions {
  timeLimit: number;
  onGameOver?: (score: number) => void;
}

interface UseSoloGameReturn {
  status: GameStatus;
  finishReason: FinishReason;
  elapsedTime: number;
  score: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const useSoloGame = ({ timeLimit, onGameOver }: UseSoloGameOptions): UseSoloGameReturn => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [finishReason, setFinishReason] = useState<FinishReason>('none');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + TIMER_INTERVAL_MS / 1000;
        if (next >= timeLimit) {
          clearTimer();
          setStatus('lost');
          setFinishReason('timeout');
          return timeLimit;
        }
        return next;
      });
    }, TIMER_INTERVAL_MS);
  }, [clearTimer, timeLimit]);

  const start = useCallback(() => {
    setStatus('playing');
    setFinishReason('none');
    setElapsedTime(0);
    setScore(0);
    startTimer();
  }, [startTimer]);

  const pause = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (status === 'playing') {
      startTimer();
    }
  }, [status, startTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setFinishReason('none');
    setElapsedTime(0);
    setScore(0);
  }, [clearTimer]);

  return { status, finishReason, elapsedTime, score, start, pause, resume, reset };
};
