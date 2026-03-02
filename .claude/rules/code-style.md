# 코드 스타일 규칙

## 함수·Export
- **화살표 함수 기본** — `const fn = (): ReturnType => { ... }`
- **named export 기본** — `export default` 금지 (프레임워크 요구 시 예외)

## 일반 규칙
| 규칙 | 설명 |
|------|------|
| `no-var` | `var` 금지, `const`/`let` 사용 |
| `prefer-const` | 재할당 없으면 `const` |
| `prefer-template` | 문자열 연결 시 템플릿 리터럴 |
| `eqeqeq` | `===`/`!==` 엄격 비교 |
| `curly` | if/else/for/while 중괄호 필수 |
| `no-nested-ternary` | 중첩 삼항 연산자 금지 |
| `no-console` | `console.log` 금지 (`warn`, `error`만 허용) |
| `no-debugger` | `debugger` 금지 |
| `no-alert` | `alert` 금지 |

## TypeScript 규칙
- **`any` 금지** — `unknown` + 타입 가드 사용
- **`interface` 우선** — `type`은 union일 경우만 사용
- **inline type import** — `import { type User } from './types'`
- 배열: 단순 타입 `T[]`, 복잡한 타입 `Array<T>`

## React 규칙 (Client)
- `forwardRef` → `ref` props 직접 사용
- `useContext` → `use` hook 사용
- 불필요한 중괄호 제거, self-closing 컴포넌트

## Prettier
| 옵션 | 값 |
|------|-----|
| `printWidth` | 100 |
| `tabWidth` | 2 |
| `semi` | true |
| `singleQuote` | true |
| `jsxSingleQuote` | false |
| `trailingComma` | all |
| `arrowParens` | always |
| `endOfLine` | lf |
