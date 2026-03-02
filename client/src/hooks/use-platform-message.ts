import { useEffect, useRef, useState } from 'react';
import { type InitPayload } from '../../../shared/types/message';
import { onPlatformMessage, sendToParent } from '../lib/platform-bridge';

export const usePlatformMessage = () => {
  const [initData, setInitData] = useState<InitPayload | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const sentReady = useRef(false);

  useEffect(() => {
    if (!sentReady.current) {
      sendToParent({ type: 'READY', payload: {} });
      sentReady.current = true;
    }

    const unsubscribe = onPlatformMessage((message) => {
      switch (message.type) {
        case 'INIT':
          setInitData(message.payload);
          break;
        case 'PAUSE':
          setIsPaused(true);
          break;
        case 'RESUME':
          setIsPaused(false);
          break;
        case 'TERMINATE':
          break;
      }
    });

    return unsubscribe;
  }, []);

  return { initData, isPaused };
};
