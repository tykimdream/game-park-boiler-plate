# CLAUDE.md

코드 작성 시 이 파일의 규칙을 따른다.

## 프로젝트 개요

__PROJECT_NAME__은 Game Park 플랫폼용 웹 게임이다. iframe으로 로드되며 postMessage API로 통신한다.

- 모노레포: `client/` (React + Vite) · `server/` (NestJS) · `shared/` (공통 타입)
- 멀티플레이: WebSocket (socket.io)

## 기술 스택

| Layer | Stack |
|-------|-------|
| Client | React 19 · TypeScript 5 · Vite · Tailwind CSS 4 · Vitest |
| Server | NestJS · TypeScript 5 · socket.io |
| Shared | TypeScript 타입 정의 |

## 프로젝트 구조

```
__PROJECT_NAME__/
├── client/          # React 게임 프론트엔드
│   └── src/
│       ├── components/   # UI 컴포넌트
│       ├── hooks/        # 커스텀 훅
│       ├── lib/          # 유틸리티
│       ├── types/        # 클라이언트 전용 타입
│       └── constants/    # 상수
├── server/          # NestJS 게임 서버 (선택적)
│   └── src/
│       ├── game/         # 게임 로직 모듈
│       ├── match/        # 매칭 모듈
│       └── ws/           # WebSocket 게이트웨이
├── shared/          # 공통 타입
│   └── types/
└── CLAUDE.md
```

**파일명**: kebab-case (`game-board.tsx`, `use-game-state.ts`)

> **코드 작업 프로토콜:**
> 1. `.claude/rules/`의 규칙과 대조하며 코드 작성
> 2. lint + format 실행
> 3. 에러 수정 후 반복

**상세 규칙:** `.claude/rules/` 참조
- `code-style.md` — 코드 스타일, TypeScript, React
- `git-convention.md` — 브랜치, 커밋, 코멘트
- `workflow.md` — 작업 프로토콜
- `game-dev.md` — 게임 아키텍처
