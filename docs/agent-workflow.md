# 에이전트 워크플로우 가이드

Game Park 웹 게임 개발을 위한 5단계 에이전트 파이프라인.
Claude Code + superpowers 스킬을 활용하여 기획부터 배포까지 구조화된 워크플로우를 따른다.

## 전체 흐름

```
Phase 1: 기획 → Phase 2: 디자인 & 에셋 → Phase 3: 개발 → Phase 4: 검증 → Phase 5: 완료
```

---

## Phase 1: 기획 (Brainstorming)

**스킬:** `/brainstorming`

**목적:** 아이디어 탐색 → 요구사항 정의 → 접근법 비교 → 디자인 승인

**사용법:**
```
Claude Code에서:
"테트리스 게임을 만들고 싶어. Game Park 플랫폼에 올릴 건데, 솔로 전용이야."
→ brainstorming 스킬이 자동 시작
→ 질문-답변으로 요구사항 구체화
→ 2-3개 접근법 제안 및 비교
→ 디자인 승인 후 문서화
```

**산출물:** `docs/plans/YYYY-MM-DD-<topic>-design.md`

**팁:**
- 가능한 구체적으로 원하는 것을 설명
- 솔로/멀티 여부, 게임 메카닉, 시각적 스타일 등을 미리 생각
- 한 번에 완벽할 필요 없음 — 질문-답변으로 정제됨

---

## Phase 2: 디자인 & 에셋 생성

**스킬:** `/plan` (구현 계획) + OpenAI Image MCP (에셋)

**목적:** 구현 계획 수립 + AI 에셋 생성

### 구현 계획
```
"구현 계획을 만들어줘"
→ writing-plans 스킬이 태스크별 구현 계획 생성
→ 파일 경로, 코드 스니펫, 테스트 방법 포함
```

**산출물:** `docs/plans/YYYY-MM-DD-<topic>-plan.md`

### AI 에셋 생성
```
"캐릭터 에셋을 AI로 만들어줘"
→ docs/ai-asset-guide.md의 프롬프트 템플릿 활용
→ MCP 도구로 이미지 생성
→ client/public/assets/에 저장
```

**산출물:** `client/public/assets/` (생성된 에셋)

**팁:**
- 에셋 생성 전에 스타일 프리픽스를 정해두면 일관성 유지 가능
- `docs/ai-asset-guide.md` 참조

---

## Phase 3: 개발 (병렬 실행)

**스킬:** `/ultrawork` 또는 서브에이전트 병렬 디스패치

**목적:** 독립 태스크를 병렬 서브에이전트로 실행

### 병렬화 전략
```
Agent A: client/ 컴포넌트 개발 (UI, 게임 보드, 모달 등)
Agent B: server/ 게임 로직 (멀티플레이어인 경우)
Agent C: shared/ 타입 정의 (새 이벤트, 상태 타입)
```

**규칙:**
- 각 에이전트는 자기 담당 디렉토리만 수정
- shared/ 타입 변경 시 client + server 양쪽 호환성 확인
- 병렬 작업 완료 후 통합 테스트

**사용법:**
```
"구현 계획에 따라 개발을 시작해줘"
→ 계획서의 태스크를 순차/병렬로 실행
→ 태스크별 커밋
```

---

## Phase 4: 검증

**스킬:** `/code-review` + 수동 검증

**체크리스트:**
1. `npx prettier --write "**/*.{ts,tsx}"` — 포맷팅
2. `cd client && npx eslint .` — 린트
3. `cd client && npx tsc --noEmit` — 타입 체크
4. `cd client && npx vitest run` — 클라이언트 테스트
5. `cd server && npm test` — 서버 테스트 (멀티인 경우)
6. 브라우저에서 수동 확인 (`npm run dev`)

**사용법:**
```
"코드 리뷰하고 검증해줘"
→ code-review 스킬로 품질 검사
→ 체크리스트 항목 순차 실행
→ 이슈 발견 시 수정 후 재검증
```

---

## Phase 5: 완료

**스킬:** Git 워크플로우

**목적:** 커밋 정리 → PR 생성 → develop 머지

**과정:**
1. 최종 lint/format/typecheck 확인
2. 커밋 메시지 `[feat] 설명` 형식 확인
3. develop 브랜치로 PR 생성
4. (선택) 리뷰 후 머지

**사용법:**
```
"커밋하고 PR 만들어줘"
→ git add + commit
→ gh pr create --base develop
```

---

## 빠른 참조

| Phase | 스킬 | 산출물 |
|-------|------|--------|
| 기획 | /brainstorming | design.md |
| 디자인 | /plan + MCP | plan.md + assets/ |
| 개발 | /ultrawork | 코드 + 커밋 |
| 검증 | /code-review | 리뷰 반영 |
| 완료 | Git | PR |
