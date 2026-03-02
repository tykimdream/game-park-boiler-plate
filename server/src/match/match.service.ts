import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
  // 매칭 로직:
  // - joinQueue(): 큐 참가
  // - leaveQueue(): 큐 이탈
  // - findMatch(): 매칭 탐색
  // - startCountdown(): 카운트다운 시작
}
