#!/bin/bash
set -e

# 사용법 출력
if [ -z "$1" ]; then
  echo "Usage: ./init.sh <project-name> [--solo-only]"
  echo ""
  echo "Options:"
  echo "  --solo-only    서버 없이 클라이언트만 생성"
  echo ""
  echo "Example:"
  echo "  ./init.sh tetris"
  echo "  ./init.sh puzzle --solo-only"
  exit 1
fi

PROJECT_NAME="$1"
SOLO_ONLY=false
TARGET_DIR="$HOME/Desktop/$PROJECT_NAME"

# 옵션 파싱
for arg in "$@"; do
  case $arg in
    --solo-only) SOLO_ONLY=true ;;
  esac
done

# 대상 디렉토리 확인
if [ -d "$TARGET_DIR" ]; then
  echo "Error: $TARGET_DIR already exists"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🎮 Creating $PROJECT_NAME..."

# 1. 복사
cp -r "$SCRIPT_DIR" "$TARGET_DIR"

# 2. init.sh 자체 및 불필요 파일 제거
rm -f "$TARGET_DIR/init.sh"
rm -rf "$TARGET_DIR/.git"
rm -f "$TARGET_DIR/.claude/settings.local.json"

# 3. __PROJECT_NAME__ 치환
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.js" -o -name "*.css" \) -exec sed -i '' "s/__PROJECT_NAME__/$PROJECT_NAME/g" {} +

echo "  ✅ Project name set to: $PROJECT_NAME"

# 4. 솔로 전용 모드
if [ "$SOLO_ONLY" = true ]; then
  echo "  🎯 Solo-only mode: removing server/"
  rm -rf "$TARGET_DIR/server"
  # server 관련 참조 정리
  sed -i '' '/server/d' "$TARGET_DIR/.claude/rules/workflow.md" 2>/dev/null || true
fi

# 5. example/ 유지 여부
read -p "  Keep example game (tic-tac-toe)? [y/N] " keep_example
if [ "$keep_example" != "y" ] && [ "$keep_example" != "Y" ]; then
  rm -rf "$TARGET_DIR/client/src/components/example"
  echo "  🗑️  Example game removed"
else
  echo "  📦 Example game kept"
fi

# 6. npm install
echo "  📦 Installing dependencies..."
cd "$TARGET_DIR/client" && npm install --silent 2>/dev/null
if [ "$SOLO_ONLY" = false ] && [ -d "$TARGET_DIR/server" ]; then
  cd "$TARGET_DIR/server" && npm install --silent 2>/dev/null
fi

# 7. git init
cd "$TARGET_DIR"
git init -q
git add -A
git commit -q -m "[config] $PROJECT_NAME 프로젝트 초기화"

echo ""
echo "✅ $PROJECT_NAME created at $TARGET_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next steps:"
echo ""
echo "  cd $TARGET_DIR"
echo "  claude"
echo ""
echo "  Then tell Claude what game you want to build!"
echo "  e.g. \"테트리스 게임을 만들고 싶어\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
