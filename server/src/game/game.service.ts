import { Injectable } from '@nestjs/common';
import { type Difficulty } from '../../../shared/types/game';

@Injectable()
export class GameService {
  /**
   * 새 게임 상태를 초기화한다.
   * 각 게임에서 구현: 보드 생성, 초기 데이터 설정 등
   *
   * TODO: 게임별로 구현
   */
  initializeGameState = (_difficulty: Difficulty, _playerData: Record<string, unknown>): Record<string, unknown> => {
    return {};
  };

  /**
   * 게임 액션을 처리한다.
   * 각 게임에서 구현: 클릭, 이동, 배치 등 게임별 액션
   *
   * TODO: 게임별로 구현
   * @returns 액션 처리 후 상태 변경 결과. won/lost가 결정되면 해당 status를 반환한다.
   */
  processAction = (
    _gameData: Record<string, unknown>,
    _action: { type: string; [key: string]: unknown },
  ): { gameData: Record<string, unknown>; status?: 'won' | 'lost'; finishReason?: string } => {
    return { gameData: _gameData };
  };

  /**
   * 본인에게 전송할 게임 상태 뷰를 반환한다.
   * 각 게임에서 구현: 숨겨야 할 정보를 필터링
   *
   * TODO: 게임별로 구현
   */
  getPlayerStateView = (_gameData: Record<string, unknown>): unknown => {
    return _gameData;
  };

  /**
   * 상대에게 전송할 게임 상태 뷰를 반환한다.
   * 각 게임에서 구현: 상대에게 보여줄 정보만 포함
   *
   * TODO: 게임별로 구현
   */
  getOpponentStateView = (_gameData: Record<string, unknown>): unknown => {
    return _gameData;
  };
}
