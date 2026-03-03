import { useEffect, useState } from 'react';
import {
  type TypedSocket,
  type SocketAuth,
  getSocket,
  disconnectSocket,
} from '../lib/socket-client';

interface UseSocketReturn {
  socket: TypedSocket | null;
  isConnected: boolean;
}

const useSocket = (auth: SocketAuth | null): UseSocketReturn => {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const s = getSocket(auth);
    setSocket(s);

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = () => {
      setIsConnected(false);
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleConnectError);

    if (s.connected) {
      setIsConnected(true);
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('connect_error', handleConnectError);
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [auth?.userId, auth?.nickname]);

  return { socket, isConnected };
};

export { useSocket };
