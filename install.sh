#!/bin/bash

# DeepSeek Obsidian Plugin Installation Script
# 一键安装脚本

set -e

echo "================================"
echo "DeepSeek Obsidian Plugin Setup"
echo "================================"
echo ""

# 定义路径
PLUGIN_DIR="/Users/Zhuanz/Documents/DSplug-in"
OBSIDIAN_KB="/Users/Zhuanz/Documents/Obsidian-KB"
OBSIDIAN_PLUGINS_DIR="$OBSIDIAN_KB/.obsidian/plugins/deepseek-obsidian-plugin"

# 第1步：检查目录
echo "✓ Step 1: Checking directories..."
if [ ! -d "$PLUGIN_DIR" ]; then
  echo "❌ Plugin directory not found: $PLUGIN_DIR"
  exit 1
fi

if [ ! -d "$OBSIDIAN_KB" ]; then
  echo "❌ Obsidian KB not found: $OBSIDIAN_KB"
  exit 1
fi

echo "  Plugin directory: $PLUGIN_DIR"
echo "  Obsidian vault: $OBSIDIAN_KB"
echo ""

# 第2步：安装依赖
echo "✓ Step 2: Installing dependencies..."
cd "$PLUGIN_DIR"
npm install
echo ""

# 第3步：构建插件
echo "✓ Step 3: Building plugin..."
npm run build
echo ""

# 第4步：创建插件目录
echo "✓ Step 4: Setting up Obsidian plugin directory..."
mkdir -p "$OBSIDIAN_PLUGINS_DIR"
echo ""

# 第5步：复制文件到Obsidian插件目录
echo "✓ Step 5: Copying plugin files..."
cp "$PLUGIN_DIR/main.js" "$OBSIDIAN_PLUGINS_DIR/"
cp "$PLUGIN_DIR/manifest.json" "$OBSIDIAN_PLUGINS_DIR/"
cp "$PLUGIN_DIR/main.d.ts" "$OBSIDIAN_PLUGINS_DIR/" 2>/dev/null || true
echo ""

# 第6步：打印配置说明
echo "✓ Step 6: Setup complete!"
echo ""
echo "================================"
echo "NEXT STEPS:"
echo "================================"
echo ""
echo "1. Open Obsidian and go to Settings"
echo "2. Navigate to Community Plugins → Installed plugins"
echo "3. You should see 'DeepSeek AI Assistant' in the list"
echo "4. Enable the plugin by toggling the switch"
echo "5. Go to plugin settings to configure your DeepSeek API Key"
echo ""
echo "API Key Configuration:"
echo "  - Go to: Settings → DeepSeek AI Assistant"
echo "  - Paste your DeepSeek API key"
echo "  - You can get one from: https://platform.deepseek.com/"
echo ""
echo "How to use the plugin:"
echo "  - Command Palette: Ctrl/Cmd + P → Search 'DeepSeek'"
echo "  - Right-click menu on selected text"
echo "  - Supported commands:"
echo "    • Open DeepSeek Chat (main AI dialog)"
echo "    • Analyze Current Note"
echo "    • Summarize Current Note"
echo "    • Enhance Current Note"
echo ""
echo "================================"
echo ""
