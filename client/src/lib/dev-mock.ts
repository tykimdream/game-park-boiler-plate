import { type PlatformToGameMessage } from '../../../shared/types';

const injectDevInit = (): void => {
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get('playerId') || '1';
  const message: PlatformToGameMessage = {
    type: 'INIT',
    payload: {
      userId: `player${playerId}`,
      nickname: `Player ${playerId}`,
      gameId: `dev-game-${Date.now()}`,
    },
  };
  setTimeout(() => {
    window.postMessage(message, '*');
  }, 100);
};

export { injectDevInit };
