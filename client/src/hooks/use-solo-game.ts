import { useCallback, useEffect, useRef, useState } from 'react';
import { type FinishReason, type GameStatus } from '../../../shared/types';
import { useTimer } from './use-timer';

interface UseSoloGameOptions {
  timeLimit: number;
  onGameOver?: (score: number, reason: FinishReason) => void;
}

interface UseSoloGameReturn {
  status: GameStatus;
  finishReason: FinishReason;
  elapsedTime: number;
  score: number;
  setScore: (score: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  finish: (won: boolean, reason: FinishReason) => void;
  reset: () => void;
}

const useSoloGame = ({ timeLimit, onGameOver }: UseSoloGameOptions): UseSoloGameReturn => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [finishReason, setFinishReason] = useState<FinishReason>('none');
  const [score, setScore] = useState(0);
  const timer = useTimer();
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const statusRef = useRef(status);
  statusRef.current = status;

  const finish = useCallback(
    (won: boolean, reason: FinishReason) => {
      if (statusRef.current !== 'playing') {
        return;
      }
      timer.stop();
      const newStatus = won ? 'won' : 'lost';
      setStatus(newStatus);
      setFinishReason(reason);
      onGameOverRef.current?.(score, reason);
    },
    [timer, score],
  );

  // time limit check
  useEffect(() => {
    if (status === 'playing' && timer.elapsedTime >= timeLimit) {
      finish(false, 'timeout');
    }
  }, [status, timer.elapsedTime, timeLimit, finish]);

  const start = useCallback(() => {
    setStatus('playing');
    setFinishReason('none');
    setScore(0);
    timer.reset();
    timer.start();
  }, [timer]);

  const pause = useCallback(() => {
    timer.stop();
  }, [timer]);

  const resume = useCallback(() => {
    if (statusRef.current === 'playing') {
      timer.start();
    }
  }, [timer]);

  const reset = useCallback(() => {
    timer.reset();
    setStatus('idle');
    setFinishReason('none');
    setScore(0);
  }, [timer]);

  return {
    status,
    finishReason,
    elapsedTime: timer.elapsedTime,
    score,
    setScore,
    start,
    pause,
    resume,
    finish,
    reset,
  };
};

export { useSoloGame };
