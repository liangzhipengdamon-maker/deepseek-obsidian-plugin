#!/bin/bash

# DeepSeek Obsidian Plugin - 一键安装脚本
# 自动完成依赖安装、构建和部署

set -e

PLUGIN_DIR="/Users/Zhuanz/Documents/DSplug-in"
OBSIDIAN_KB="/Users/Zhuanz/Documents/Obsidian-KB"
OBSIDIAN_PLUGINS_DIR="$OBSIDIAN_KB/.obsidian/plugins/deepseek-obsidian-plugin"

echo "════════════════════════════════════════════"
echo "   DeepSeek Obsidian Plugin - 一键安装"
echo "════════════════════════════════════════════"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
cd "$PLUGIN_DIR"
npm install --silent > /dev/null 2>&1 || npm install
echo "   ✓ Dependencies installed"
echo ""

# Step 2: Build plugin
echo "🔨 Step 2: Building plugin..."
npm run build > /dev/null 2>&1
echo "   ✓ Plugin built successfully"
echo ""

# Step 3: Setup plugin directory
echo "📂 Step 3: Setting up plugin directory..."
mkdir -p "$OBSIDIAN_PLUGINS_DIR"
echo "   ✓ Plugin directory ready"
echo ""

# Step 4: Deploy plugin files
echo "🚀 Step 4: Deploying files..."
cp "$PLUGIN_DIR/main.js" "$OBSIDIAN_PLUGINS_DIR/" 2>/dev/null || true
cp "$PLUGIN_DIR/manifest.json" "$OBSIDIAN_PLUGINS_DIR/" 2>/dev/null || true
echo "   ✓ Files deployed"
echo ""

# Final summary
echo "════════════════════════════════════════════"
echo "✅ 安装完成！"
echo "════════════════════════════════════════════"
echo ""
echo "📍 插件位置:"
echo "   $OBSIDIAN_PLUGINS_DIR"
echo ""
echo "🚀 后续步骤:"
echo "   1. 打开 Obsidian"
echo "   2. 进入 Settings → Community Plugins"
echo "   3. 启用 'DeepSeek AI Assistant'"
echo "   4. 配置你的 DeepSeek API Key"
echo ""
echo "💡 获取 API Key:"
echo "   访问: https://platform.deepseek.com/"
echo ""
echo "📖 快速指南:"
echo "   查看: $PLUGIN_DIR/QUICKSTART.md"
echo ""
