import { Injectable } from '@nestjs/common';
import { type Difficulty, type MatchResult } from '../../../shared/types/game';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const MULTIPLAYER_BONUS: Record<MatchResult, number> = {
  win: 50,
  lose: 10,
  draw: 30,
};

@Injectable()
export class ScoringService {
  /**
   * 게임별 점수를 계산한다. 각 게임에서 오버라이드하여 사용한다.
   *
   * TODO: 게임별로 구현
   * - params에 게임별 데이터를 전달
   * - 난이도 배율(DIFFICULTY_MULTIPLIER)을 적용
   */
  readonly calculateScore = (params: {
    difficulty: Difficulty;
    elapsedSeconds: number;
    gameData: Record<string, unknown>;
    won: boolean;
  }): number => {
    const { difficulty, won } = params;
    const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
    const base = won ? 100 : 10;
    return Math.max(0, Math.round(base * multiplier));
  };

  readonly calculateMultiplayerBonus = (result: MatchResult): number => {
    return MULTIPLAYER_BONUS[result];
  };
}
