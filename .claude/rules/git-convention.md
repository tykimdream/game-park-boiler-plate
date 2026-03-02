# Git 규칙

## Branch
`{level}/{name}/{keyword}` (e.g., `f/jeh/minesweeper`)

## Commit
`[level] description` (e.g., `[feat] 지뢰찾기 보드 렌더링 구현`)

**Co-Author 금지**: 커밋 메시지에 `Co-Authored-By` 줄을 추가하지 않는다.

| Level | 약어 | 설명 |
|-------|------|------|
| add | a | 패키지 추가 |
| config | - | config 파일 수정 |
| chore | - | 기능에 영향 없는 파일 수정 |
| docs | d | 문서 작성/수정 |
| feat | f | 새로운 기능 추가 |
| bugfix | b | 버그 수정 |
| refactor | r | 코드 리팩터링 |
| style | s | CSS 코드 수정 |

## 코멘트
형식: `// {LEVEL}: {description} {date} {name}`

| Level | 설명 |
|-------|------|
| TODO | 앞으로 추가해야 할 내용 |
| HACK | 임시로 해결한 코드 |
| FIXME | 오작동이 알려진 코드 |
| XXX | 당장 수정 필요한 코드 |
