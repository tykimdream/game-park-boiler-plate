# 작업 워크플로우 규칙

## 코드 작성 프로토콜
1. 코드를 생성·수정할 때 rules/의 규칙과 대조하며 작성한다
2. 코드 작성이 끝나면 lint와 format을 실행한다
3. 에러가 있으면 수정 후 반복한다

## 커밋 전 체크리스트
- `npx prettier --write` 로 포맷팅
- `npx eslint` 로 린트 (신규 에러 0)
- `npx tsc --noEmit` 로 타입 체크
- `npm test` 로 테스트 통과 확인

## 브랜치 전략
- `develop` — 기본 개발 브랜치
- `f/{name}/{keyword}` — 기능 브랜치
- `b/{name}/{keyword}` — 버그 수정 브랜치
- `r/{name}/{keyword}` — 리팩터링 브랜치

## 명령어 실행 시 PATH
- macOS: `export PATH="/opt/homebrew/bin:/usr/bin:/usr/local/bin:$PATH"` 필요

## 테스트 명령어
- Server: `cd server && npm test`
- Client: `cd client && npx vitest run`
- 타입 체크: `npx tsc --noEmit`
