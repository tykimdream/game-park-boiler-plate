import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMER_INTERVAL_MS } from '../constants';

interface UseTimerReturn {
  elapsedTime: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const useTimer = (): UseTimerReturn => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current !== null) {
      return;
    }
    startTimeRef.current = performance.now();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const now = performance.now();
        const seconds = accumulatedRef.current + (now - startTimeRef.current) / 1000;
        setElapsedTime(Math.round(seconds * 10) / 10);
      }
    }, TIMER_INTERVAL_MS);
  }, []);

  const stop = useCallback(() => {
    if (startTimeRef.current !== null) {
      accumulatedRef.current += (performance.now() - startTimeRef.current) / 1000;
      startTimeRef.current = null;
    }
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setElapsedTime(0);
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { elapsedTime, start, stop, reset };
};

export { useTimer };
