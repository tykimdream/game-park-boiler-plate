import { io, type Socket } from 'socket.io-client';
import { type ClientToServerEvents, type ServerToClientEvents } from '../../../shared/types';
import { WS_URL } from '../constants';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketAuth {
  userId: string;
  nickname: string;
}

let socket: TypedSocket | null = null;

const getSocket = (auth: SocketAuth): TypedSocket => {
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

const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { getSocket, disconnectSocket };
export type { TypedSocket, SocketAuth };
