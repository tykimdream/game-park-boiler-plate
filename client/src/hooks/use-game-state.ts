import { useEffect, useState } from 'react';
import { type Socket } from 'socket.io-client';
import { type GameStatus } from '../../../shared/types/game';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '../../../shared/types/ws-events';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseGameStateReturn {
  status: GameStatus;
  elapsedTime: number;
  score: number;
  opponentScore: number;
  result: 'win' | 'lose' | 'draw' | null;
}

export const useGameState = (socket: TypedSocket | null): UseGameStateReturn => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onStarted = () => {
      setStatus('playing');
      setElapsedTime(0);
    };

    const onTimerTick = ({ elapsedTime: time }: { elapsedTime: number }) => {
      setElapsedTime(time);
    };

    const onResult = ({
      result: r,
      score: s,
      opponentScore: os,
    }: {
      result: 'win' | 'lose' | 'draw';
      score: number;
      opponentScore: number;
    }) => {
      setResult(r);
      setScore(s);
      setOpponentScore(os);
      setStatus(r === 'win' ? 'won' : 'lost');
    };

    socket.on('game:started', onStarted);
    socket.on('game:timer-tick', onTimerTick);
    socket.on('game:result', onResult);

    return () => {
      socket.off('game:started', onStarted);
      socket.off('game:timer-tick', onTimerTick);
      socket.off('game:result', onResult);
    };
  }, [socket]);

  return { status, elapsedTime, score, opponentScore, result };
};
