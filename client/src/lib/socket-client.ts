import { io, type Socket } from 'socket.io-client';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '../../../shared/types/ws-events';
import { WS_URL } from '../constants';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketAuth {
  userId: string;
  nickname: string;
}

let socket: TypedSocket | null = null;

export const getSocket = (auth: SocketAuth): TypedSocket => {
  if (socket?.connected) {
    return socket;
  }
  socket = io(WS_URL, {
    auth,
    transports: ['websocket'],
    autoConnect: true,
  }) as TypedSocket;
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
