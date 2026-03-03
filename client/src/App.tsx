import { useCallback, useMemo, useState } from 'react';
import { type Difficulty } from '../../shared/types';
import { type AppPhase, type MatchResultState } from './types';
import { usePlatformMessage } from './hooks/use-platform-message';
import { useSocket } from './hooks/use-socket';
import { useMatch } from './hooks/use-match';
import { useGameState } from './hooks/use-game-state';
import { useSoloGame } from './hooks/use-solo-game';
import { sendToParent } from './lib/platform-bridge';
import { type SocketAuth } from './lib/socket-client';
import { DEV_MODE } from './constants';
import { TicTacToe } from './components/example/tic-tac-toe';

const DEFAULT_TIME_LIMIT = 180;

export const App = () => {
  const { initData, isPaused } = usePlatformMessage();
  const [phase, setPhase] = useState<AppPhase>('init');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [soloScore, setSoloScore] = useState(0);
  const [multiResult, setMultiResult] = useState<MatchResultState | null>(null);

  const isReady = DEV_MODE || initData !== null;

  const socketAuth = useMemo<SocketAuth | null>(() => {
    if (!initData?.userId) {
      return null;
    }
    return { userId: initData.userId, nickname: initData.nickname };
  }, [initData?.userId, initData?.nickname]);

  const { socket } = useSocket(socketAuth);
  const match = useMatch(socket);
  const gameState = useGameState(socket);

  const soloGame = useSoloGame({
    timeLimit: DEFAULT_TIME_LIMIT,
    onGameOver: (score) => {
      setSoloScore(score);
      sendToParent({
        type: 'GAME_OVER',
        payload: {
          userId: initData?.userId ?? null,
          gameId: initData?.gameId ?? '',
          score,
          playtime: soloGame.elapsedTime,
        },
      });
      setPhase('result');
    },
  });

  // lobby에서 솔로 시작
  const handleSoloStart = useCallback(
    (difficulty: Difficulty) => {
      setSelectedDifficulty(difficulty);
      soloGame.start();
      setPhase('solo-play');
    },
    [soloGame],
  );

  // lobby에서 멀티 매칭 시작
  const handleMultiStart = useCallback(
    (difficulty: Difficulty) => {
      setSelectedDifficulty(difficulty);
      match.joinQueue(difficulty);
      setPhase('matching');
    },
    [match],
  );

  // 매칭 취소
  const handleMatchCancel = useCallback(() => {
    match.leaveQueue();
    setPhase('lobby');
  }, [match]);

  // 솔로 게임 오버 (외부 컴포넌트에서 호출)
  const handleGameOver = useCallback(
    (score: number) => {
      setSoloScore(score);
      soloGame.finish(score > 0, score > 0 ? 'cleared' : 'died');
    },
    [soloGame],
  );

  // 로비로 돌아가기
  const handleBackToLobby = useCallback(() => {
    soloGame.reset();
    match.reset();
    gameState.reset();
    setMultiResult(null);
    setPhase('lobby');
  }, [soloGame, match, gameState]);

  // match phase 동기화
  if (match.phase === 'countdown' && phase === 'matching') {
    setPhase('countdown');
  }
  if (match.phase === 'playing' && phase === 'countdown') {
    setPhase('multi-play');
  }
  if (match.phase === 'result' && phase === 'multi-play' && match.matchResult) {
    setMultiResult(match.matchResult);
    setPhase('result');
  }

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center">플랫폼 연결 대기 중...</div>
    );
  }

  // init → lobby 자동 전환
  if (phase === 'init') {
    setPhase('lobby');
    return null;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* 로비 */}
      {phase === 'lobby' && (
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold">Game Lobby</h1>
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                className="rounded bg-blue-500 px-4 py-2 capitalize text-white hover:bg-blue-600"
                onClick={() => handleSoloStart(d)}
              >
                Solo {d}
              </button>
            ))}
          </div>
          {socketAuth && (
            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className="rounded bg-green-500 px-4 py-2 capitalize text-white hover:bg-green-600"
                  onClick={() => handleMultiStart(d)}
                >
                  Multi {d}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 매칭 대기 */}
      {phase === 'matching' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl">매칭 중... ({selectedDifficulty})</p>
          <p className="text-sm text-gray-500">
            대기열: {match.queueInfo.queueSize}명 / 예상 대기: {match.queueInfo.estimatedWait}초
          </p>
          <button
            className="rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600"
            onClick={handleMatchCancel}
          >
            취소
          </button>
        </div>
      )}

      {/* 카운트다운 */}
      {phase === 'countdown' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">
            vs {match.matchInfo?.opponentNickname ?? '???'}
          </p>
          <p className="text-6xl font-bold">{match.countdown}</p>
        </div>
      )}

      {/* 솔로 플레이 */}
      {phase === 'solo-play' && (
        <TicTacToe isPaused={isPaused} onGameOver={handleGameOver} />
      )}

      {/* 멀티 플레이 */}
      {phase === 'multi-play' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">
            vs {match.matchInfo?.opponentNickname ?? '???'} ({selectedDifficulty})
          </p>
          <p>내 시간: {gameState.myElapsedTime.toFixed(1)}s</p>
          <p>상대 시간: {gameState.opponentElapsedTime.toFixed(1)}s</p>
          <p className="text-sm text-gray-500">
            TODO: 게임별 멀티플레이 UI를 여기에 구현
          </p>
          <button
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() => socket?.emit('game:forfeit', {})}
          >
            포기
          </button>
        </div>
      )}

      {/* 결과 */}
      {phase === 'result' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-bold">게임 종료!</p>
          {multiResult ? (
            <>
              <p className="text-xl capitalize">{multiResult.result}</p>
              <p>내 점수: {multiResult.myScore} / 상대 점수: {multiResult.opponentScore}</p>
              <p>내 시간: {multiResult.myTime.toFixed(1)}s / 상대 시간: {multiResult.opponentTime.toFixed(1)}s</p>
            </>
          ) : (
            <p>점수: {soloScore}</p>
          )}
          <button
            className="rounded bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
            onClick={handleBackToLobby}
          >
            다시 하기
          </button>
        </div>
      )}
    </div>
  );
};
