import {
  type GameToPlatformMessage,
  type PlatformToGameMessage,
} from '../../../shared/types/message';

export const sendToParent = (message: GameToPlatformMessage): void => {
  window.parent.postMessage(message, '*');
};

export const onPlatformMessage = (
  handler: (message: PlatformToGameMessage) => void,
): (() => void) => {
  const listener = (event: MessageEvent<unknown>) => {
    const data = event.data;
    if (
      data !== null &&
      typeof data === 'object' &&
      'type' in data &&
      typeof (data as Record<string, unknown>).type === 'string'
    ) {
      handler(data as PlatformToGameMessage);
    }
  };
  window.addEventListener('message', listener);
  return () => {
    window.removeEventListener('message', listener);
  };
};
