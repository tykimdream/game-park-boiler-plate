# 게임 개발 규칙

## 아키텍처 원칙
- 클라이언트와 서버의 게임 로직은 shared 타입으로 동기화한다
- 멀티플레이어에서 시드 기반 결정론적 알고리즘을 사용한다 (Mulberry32 PRNG)
- 서버가 게임 상태의 source of truth (멀티플레이어)

## 모노레포 구조
- `shared/types/` — 클라이언트와 서버가 공유하는 타입 정의
- `client/` — React 프론트엔드 (게임 렌더링, 유저 인터랙션)
- `server/` — NestJS 백엔드 (게임 로직, 매칭, WebSocket)
- 타입 변경 시 반드시 client와 server 양쪽의 호환성을 확인한다

## WebSocket 이벤트 규칙
- 모든 이벤트는 `shared/types/ws-events.ts`에 타입을 정의한다
- Client→Server: `queue:*`, `game:*` 네임스페이스
- Server→Client: `queue:*`, `match:*`, `game:*`, `error` 네임스페이스
- 새 이벤트 추가 시 `ClientToServerEvents` 또는 `ServerToClientEvents` 인터페이스에 반드시 추가

## 게임 상태 관리
- 솔로 게임: 클라이언트에서 전체 로직 처리 (use-solo-game.ts)
- 멀티 게임: 서버에서 로직 처리, 클라이언트는 뷰 동기화만 (use-game-state.ts)
- 게임 상태: idle → playing → won/lost

## Game Park 플랫폼 통합
- postMessage API로 통신 (shared/types/message.ts)
- 생명주기: READY → INIT → SCORE → GAME_OVER
- 인증: 플랫폼에서 userId + nickname 전달 → WebSocket 연결 시 사용
