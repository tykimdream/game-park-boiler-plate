import { useState } from 'react';
import { type AppPhase } from './types';
import { usePlatformMessage } from './hooks/use-platform-message';
import { sendToParent } from './lib/platform-bridge';
import { DEV_MODE } from './constants';
import { TicTacToe } from './components/example/tic-tac-toe';

export const App = () => {
  const { initData, isPaused } = usePlatformMessage();
  const [phase, setPhase] = useState<AppPhase>('init');

  const isReady = DEV_MODE || initData !== null;

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">플랫폼 연결 대기 중...</div>
    );
  }

  const handleGameOver = (score: number) => {
    sendToParent({
      type: 'GAME_OVER',
      payload: {
        userId: initData?.userId ?? null,
        gameId: initData?.gameId ?? '',
        score,
        playtime: 0,
      },
    });
    setPhase('result');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {phase === 'init' && (
        <button
          className="rounded bg-blue-500 px-6 py-3 text-white"
          onClick={() => setPhase('solo-play')}
        >
          게임 시작
        </button>
      )}

      {phase === 'solo-play' && (
        <TicTacToe isPaused={isPaused} onGameOver={handleGameOver} />
      )}

      {phase === 'result' && (
        <div className="text-center">
          <p className="text-2xl font-bold">게임 종료!</p>
          <button
            className="mt-4 rounded bg-blue-500 px-6 py-3 text-white"
            onClick={() => setPhase('init')}
          >
            다시 하기
          </button>
        </div>
      )}
    </div>
  );
};
