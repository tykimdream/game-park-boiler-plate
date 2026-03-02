import { useEffect, useRef, useState } from 'react';
import { type Socket } from 'socket.io-client';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '../../../shared/types/ws-events';
import { disconnectSocket, getSocket } from '../lib/socket-client';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  userId: string;
  nickname: string;
}

export const useSocket = ({ userId, nickname }: UseSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    const socket = getSocket({ userId, nickname });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [userId, nickname]);

  return { socket: socketRef.current, isConnected };
};
