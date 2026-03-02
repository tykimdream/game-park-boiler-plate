# Game Park 웹 게임 보일러플레이트

Game Park 플랫폼용 웹 게임을 빠르게 시작하기 위한 보일러플레이트.
Claude Code 에이전트 워크플로우 + 코드 템플릿이 포함되어 있다.

## Quick Start

```bash
# 새 게임 프로젝트 생성
./init.sh <project-name>

# 솔로 전용 (서버 없이)
./init.sh <project-name> --solo-only

# 예시
./init.sh tetris
./init.sh puzzle --solo-only
```

생성 후:
```bash
cd ~/Desktop/<project-name>
claude    # Claude Code 시작
```

## 프로젝트 구조

```
<project-name>/
├── client/              # React 19 + Vite + Tailwind CSS 4
│   └── src/
│       ├── components/  # UI 컴포넌트
│       ├── hooks/       # 게임 훅 (use-solo-game, use-game-state 등)
│       ├── lib/         # 유틸리티 (platform-bridge, socket, prng)
│       ├── types/       # 클라이언트 전용 타입
│       └── constants/   # 상수
├── server/              # NestJS + socket.io (--solo-only 시 제거)
│   └── src/
│       ├── game/        # 게임 로직 모듈
│       ├── match/       # 매칭 모듈
│       └── ws/          # WebSocket 게이트웨이
├── shared/              # 공통 타입
│   └── types/
│       ├── message.ts   # Game Park postMessage 프로토콜
│       ├── ws-events.ts # WebSocket 이벤트 타입
│       └── game.ts      # 게임 상태 타입
├── .claude/             # Claude Code 설정
│   ├── settings.json    # 허용/차단 패턴
│   ├── hooks/           # 안전 훅 (위험 명령 차단, console.log 감지)
│   └── rules/           # 코드 스타일, Git, 워크플로우, 게임 개발 규칙
├── docs/
│   ├── agent-workflow.md   # 에이전트 5단계 파이프라인 가이드
│   ├── ai-asset-guide.md   # AI 에셋 생성 프롬프트 라이브러리
│   └── plans/              # 디자인/구현 계획 문서
├── CLAUDE.md            # Claude Code 마스터 규칙
└── init.sh              # 프로젝트 초기화 스크립트
```

## 에이전트 워크플로우

5단계 파이프라인으로 게임을 개발한다. 자세한 내용은 `docs/agent-workflow.md` 참조.

```
Phase 1: 기획        → brainstorming으로 아이디어 구체화
Phase 2: 디자인      → 구현 계획 + AI 에셋 생성
Phase 3: 개발        → 서브에이전트 병렬 실행
Phase 4: 검증        → lint/format/typecheck/test + 코드 리뷰
Phase 5: 완료        → 커밋 + PR
```

## 게임별 커스터마이징 포인트

### 솔로 게임
1. `shared/types/game.ts` — 게임 타입 확장
2. `client/src/hooks/use-solo-game.ts` — 게임 로직 구현
3. `client/src/components/` — 게임 UI 컴포넌트 추가
4. `client/src/App.tsx` — 게임 컴포넌트 연결

### 멀티플레이어 게임
위 + 추가로:
5. `shared/types/ws-events.ts` — WebSocket 이벤트 추가
6. `client/src/hooks/use-game-state.ts` — 서버 상태 동기화
7. `server/src/ws/game.gateway.ts` — 서버 게임 이벤트 처리
8. `server/src/game/game.service.ts` — 서버 게임 로직

## 포함된 유틸리티

| 파일 | 용도 |
|------|------|
| `lib/platform-bridge.ts` | Game Park postMessage 통신 |
| `lib/socket-client.ts` | 타입 안전한 socket.io 싱글턴 |
| `lib/prng.ts` | Mulberry32 시드 기반 난수 (멀티 동기화용) |
| `hooks/use-platform-message.ts` | 플랫폼 INIT/PAUSE/RESUME 처리 |
| `hooks/use-solo-game.ts` | 솔로 게임 타이머/상태 뼈대 |
| `hooks/use-game-state.ts` | 멀티 상태 동기화 뼈대 |
| `hooks/use-socket.ts` | 소켓 연결 관리 |

## 기술 스택

| Layer | Stack |
|-------|-------|
| Client | React 19, TypeScript 5, Vite, Tailwind CSS 4, Vitest |
| Server | NestJS 11, TypeScript 5, socket.io 4 |
| Shared | TypeScript 타입 정의 |
| AI Asset | OpenAI Image Generation (MCP) |

## 개발 명령어

```bash
# 클라이언트 개발 서버
cd client && npm run dev

# 서버 개발 모드
cd server && npm run start:dev

# 린트 & 포맷
cd client && npm run lint && npm run format

# 타입 체크
cd client && npx tsc --noEmit

# 테스트
cd client && npx vitest run
cd server && npm test
```
