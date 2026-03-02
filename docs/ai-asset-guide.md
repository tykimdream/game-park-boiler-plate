# AI 에셋 생성 가이드

OpenAI Image Generation MCP를 활용한 게임 에셋 생성 가이드.

## 사전 설정

### MCP 설정
`.claude/settings.local.json`에 다음이 포함되어 있어야 한다:
```json
{
  "permissions": {
    "allow": ["mcp__openai-image__generate_image_gpt"]
  }
}
```

### OpenAI API 키
MCP 서버 설정에서 OPENAI_API_KEY가 구성되어 있어야 한다.

---

## 스타일 프리픽스 시스템

모든 에셋에 일관된 아트 스타일을 적용하기 위해 **스타일 프리픽스**를 사용한다.
프로젝트 시작 시 하나의 프리픽스를 정하고, 모든 프롬프트 앞에 붙인다.

### 프리픽스 예시

**파스텔 일러스트 스타일:**
```
Soft pastel illustration, watercolor texture, warm lighting,
lavender-mint-peach color palette, Studio Ghibli + Sanrio inspired
```

**픽셀아트 스타일:**
```
16-bit pixel art style, clean pixel edges, limited color palette,
bright saturated colors, retro game aesthetic
```

**플랫 디자인 스타일:**
```
Flat design illustration, bold colors, minimal shadows,
geometric shapes, modern casual game style
```

---

## 카테고리별 프롬프트 템플릿

### 1. 캐릭터

**메인 캐릭터:**
```
[스타일 프리픽스],
cute chibi [캐릭터 설명], front-facing,
simple expressive face, round proportions,
white background, full body, character sheet style
```

**적/장애물:**
```
[스타일 프리픽스],
cute round [적 설명], slightly mischievous expression,
simple design, white background, multiple poses:
idle, alert, defeated
```

**감정 표현 시트:**
```
[스타일 프리픽스],
[캐릭터 이름] emotion sheet, 6 expressions:
happy, sad, surprised, angry, nervous, excited,
consistent style, white background, grid layout
```

### 2. 배경

**게임 보드 배경:**
```
[스타일 프리픽스],
[배경 설명] game board background, seamless tileable pattern,
subtle texture, not distracting, soft colors,
1024x1024, high quality
```

**로비/메뉴 배경:**
```
[스타일 프리픽스],
cozy [장면 설명] scene, warm atmosphere,
suitable as game menu background, slightly blurred depth,
16:9 aspect ratio, high quality
```

### 3. UI 요소

**버튼/아이콘:**
```
[스타일 프리픽스],
game UI icon set: [아이콘 목록],
consistent style, transparent background,
64x64 each, clean edges, PNG
```

**뱃지/보상:**
```
[스타일 프리픽스],
achievement badge: [뱃지 설명],
golden frame, shiny effect, transparent background,
256x256, high quality
```

### 4. 마케팅

**OG 썸네일 (1200x630):**
```
[스타일 프리픽스],
game promotional banner for "[게임 이름]",
[주요 캐릭터]가 [액션] 하는 장면,
bold title text space on left, characters on right,
vibrant colors, 1200x630, eye-catching composition
```

**앱 아이콘 (1024x1024):**
```
[스타일 프리픽스],
app icon for "[게임 이름]", simple recognizable design,
[핵심 심볼], rounded square safe area,
1024x1024, clean edges
```

**소셜 미디어 (1080x1080):**
```
[스타일 프리픽스],
social media post for "[게임 이름]",
[장면 설명], text overlay space,
1080x1080 square format, Instagram-ready
```

---

## 생성 팁

### 해상도
- 캐릭터/아이콘: `1024x1024` (정사각형)
- 배경: `1536x1024` (가로) 또는 `1024x1536` (세로)
- 썸네일: `1536x1024` → 후처리로 1200x630 크롭

### 투명 배경
```
background: "transparent"  # MCP 옵션
```
캐릭터, 아이콘 등 오버레이용 에셋에 사용.

### 일관성 유지
- 같은 스타일 프리픽스를 모든 프롬프트에 사용
- 캐릭터 디자인 시 첫 생성 결과를 레퍼런스로 설명에 포함
- 색상 팔레트를 명시적으로 지정 (hex 코드)

### 반복 생성
- 첫 생성이 마음에 안 들면 프롬프트를 수정하여 재생성
- "more [특성]", "less [특성]"으로 미세 조정
- 여러 변형을 생성한 후 가장 좋은 것을 선택

---

## 파일 저장 규칙

```
client/public/assets/
├── characters/       # 캐릭터 이미지
├── backgrounds/      # 배경 이미지
├── ui/               # UI 요소 (버튼, 아이콘)
├── marketing/        # OG 썸네일, 소셜 미디어
└── sounds/           # 사운드 에셋 (수동 추가)
```

파일명: kebab-case (`main-character-idle.png`, `lobby-background.png`)
