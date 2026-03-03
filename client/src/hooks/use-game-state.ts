import { useCallback, useEffect, useState } from 'react';
import {
  type GameStateUpdatePayload,
  type OpponentStateUpdatePayload,
  type TimerTickPayload,
} from '../../../shared/types';
import { type TypedSocket } from '../lib/socket-client';

interface UseGameStateReturn {
  myState: unknown;
  opponentState: unknown;
  myElapsedTime: number;
  opponentElapsedTime: number;
  reset: () => void;
}

const useGameState = (socket: TypedSocket | null): UseGameStateReturn => {
  const [myState, setMyState] = useState<unknown>(null);
  const [opponentState, setOpponentState] = useState<unknown>(null);
  const [myElapsedTime, setMyElapsedTime] = useState(0);
  const [opponentElapsedTime, setOpponentElapsedTime] = useState(0);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleStateUpdate = (payload: GameStateUpdatePayload) => {
      setMyState(payload.state);
      setMyElapsedTime(payload.elapsedTime);
    };

    const handleOpponentStateUpdate = (payload: OpponentStateUpdatePayload) => {
      setOpponentState(payload.state);
      setOpponentElapsedTime(payload.elapsedTime);
    };

    const handleTimerTick = (payload: TimerTickPayload) => {
      setMyElapsedTime(payload.myTime);
      setOpponentElapsedTime(payload.opponentTime);
    };

    socket.on('game:state-update', handleStateUpdate);
    socket.on('game:opponent-state-update', handleOpponentStateUpdate);
    socket.on('game:timer-tick', handleTimerTick);

    return () => {
      socket.off('game:state-update', handleStateUpdate);
      socket.off('game:opponent-state-update', handleOpponentStateUpdate);
      socket.off('game:timer-tick', handleTimerTick);
    };
  }, [socket]);

  const reset = useCallback(() => {
    setMyState(null);
    setOpponentState(null);
    setMyElapsedTime(0);
    setOpponentElapsedTime(0);
  }, []);

  return { myState, opponentState, myElapsedTime, opponentElapsedTime, reset };
};

export { useGameState };
