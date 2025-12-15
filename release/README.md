# 🚀 DeepSeek Obsidian Plugin

> 在Obsidian中集成DeepSeek AI助手，智能管理你的知识库

![Status](https://img.shields.io/badge/status-ready-brightgreen) ![Language](https://img.shields.io/badge/language-TypeScript-blue) ![Framework](https://img.shields.io/badge/framework-Obsidian-purple) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 主要特性

- **🤖 AI对话框** - Copilot风格的多轮对话界面，支持流式响应和思考过程展示
- **🔍 知识库检索** - AI自动查询你的笔记提供上下文
- **📊 笔记分析** - 分析、总结、优化笔记内容
- **⚡ 4种使用方式** - 命令面板、右键菜单、侧边栏、对话框
- **🔧 灵活配置** - API Key、模型、温度等可自定义
- **🔒 隐私安全** - 知识库只读，不会被修改
- **💾 对话持久化** - 重启Obsidian后仍可恢复历史对话

---

## 🎯 快速开始

### 一键安装

```bash
cd /Users/Zhuanz/Documents/DSplug-in
chmod +x auto-install.sh
./auto-install.sh
```

### 启用插件

1. 打开 Obsidian
2. Settings → Community Plugins → Installed plugins
3. 找到 **DeepSeek AI Assistant** 并启用
4. 进入插件设置，配置 **API Key**

### 开始使用

- **快捷键**: `Cmd + P` → 搜索 "DeepSeek"
- **右键菜单**: 选中文本右键点击
- **更多详情**: 查看 [INSTALL.md](./INSTALL.md) 或 [QUICKSTART.md](./QUICKSTART.md)

---

## 📁 项目结构

```
DSplug-in/
├── main.ts                          # 插件主文件（入口）
├── manifest.json                    # 插件清单
├── package.json                     # NPM配置
├── tsconfig.json                    # TypeScript配置
├── esbuild.config.mjs              # 打包配置
├── src/
│   ├── services/
│   │   ├── deepseekService.ts      # DeepSeek API封装
│   │   └── knowledgeBaseService.ts # 知识库搜索引擎
│   ├── modals/
│   │   └── ChatModal.ts            # AI对话框组件
│   └── panels/
│       └── AIPanel.ts              # 侧边栏面板组件
├── auto-install.sh                 # 一键安装脚本
├── INSTALL.md                      # 详细安装指南
├── QUICKSTART.md                   # 快速使用指南
└── README.md                       # 本文件
```

---

## 🔧 开发

### 环境要求

- Node.js >= 16
- npm >= 7

### 开发模式

```bash
# 实时监听文件变化
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint
```

### 更新插件

修改代码后：

```bash
npm run build
cp main.js /Users/Zhuanz/Documents/Obsidian-KB/.obsidian/plugins/deepseek-obsidian-plugin/
cp manifest.json /Users/Zhuanz/Documents/Obsidian-KB/.obsidian/plugins/deepseek-obsidian-plugin/
```

---

## 📖 功能详解

### 1. AI对话框 - 最强大的功能

**打开**: `Cmd + P` → `Open DeepSeek Chat`

特点：
- ✅ 自动检索知识库
- ✅ 保留对话历史
- ✅ 支持多轮对话
- ✅ 实时流式响应
- ✅ 显示AI思考过程

### 2. 笔记分析

**打开**: `Cmd + P` → `Analyze Current Note`

获得：
- 内容洞察
- 关键点总结
- 改进建议

### 3. 笔记总结

**打开**: `Cmd + P` → `Summarize Current Note`

快速获得笔记的核心要点。

### 4. 内容增强

**打开**: `Cmd + P` → `Enhance Current Note`

改进笔记的：
- 清晰度
- 结构
- 表达力

### 5. 右键菜单

选中任何文本，右键选择：
- **Analyze Selection** - 分析选中内容
- **Search Knowledge Base** - 在知识库中搜索

---

## ⚙️ 配置说明

### API Key

从 https://platform.deepseek.com/ 获取

进入 Settings → DeepSeek AI Assistant → 粘贴 API Key

### 温度 (Temperature)

- **0.0-0.3**: 更准确、更一致的回答
- **0.5-0.7**: 平衡（推荐）
- **0.8-1.0**: 更有创意、更多样化

### 其他参数

| 参数 | 说明 | 默认值 |
|-----|------|-------|
| API URL | API端点 | `https://api.deepseek.com/v1` |
| Model | 使用的模型 | `deepseek-reasoner` |
| Knowledge Base Path | 知识库位置 | 自动检测 |

---

## 🛠️ 故障排除

### 插件不显示

- [ ] 检查 `~/.obsidian/plugins/deepseek-obsidian-plugin/` 存在
- [ ] 重启 Obsidian
- [ ] 重新运行安装脚本

### API 错误

- [ ] 验证 API Key 正确性（无多余空格）
- [ ] 检查网络连接
- [ ] 确保有足够的API配额

### 知识库搜索无结果

- [ ] 确保知识库路径正确
- [ ] 笔记必须是 `.md` 格式
- [ ] 尝试更通用的搜索词

### 性能问题

- [ ] 大型知识库会拖慢搜索，考虑分割
- [ ] 减少搜索结果数量（modals/ChatModal.ts中调整）
- [ ] 提高 API 的配额

---

## 📚 文档

- [INSTALL.md](./INSTALL.md) - 详细安装指南
- [QUICKSTART.md](./QUICKSTART.md) - 快速使用指南
- [DeepSeek API文档](https://platform.deepseek.com/docs)
- [Obsidian插件文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)

---

## 🎓 使用场景

### 学习和研究
```
问: "我知识库里有关AI的内容讲了什么？"
→ AI自动查找相关笔记，综合回答
```

### 笔记优化
```
选中笔记草稿 → 右键Analyze
→ 获得详细改进建议
```

### 内容关联
```
问: "这个概念和我之前学的什么有关？"
→ AI建立知识关联
```

---

## 🔒 隐私和安全

✅ **知识库只读** - 插件只读取不修改知识库
✅ **本地处理** - API调用在本地完成
✅ **无数据上传** - 知识库内容仅用于搜索上下文
✅ **API密钥安全** - 存储在本地 Obsidian 配置中

---

## 📊 技术栈

- **语言**: TypeScript
- **框架**: Obsidian API
- **打包**: esbuild
- **AI服务**: DeepSeek
- **包管理**: npm

---

## 📝 开源许可

MIT License - 详见 [LICENSE](./LICENSE)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📞 支持

- 📧 发送问题到项目路径下的 issues
- 💬 查看 [QUICKSTART.md](./QUICKSTART.md) 获得常见问题答案
- 🌐 访问 [DeepSeek官网](https://deepseek.com/) 了解模型信息

---

## 🎉 致谢

感谢：
- Obsidian 团队提供的强大的插件框架
- DeepSeek 团队提供的高效的AI模型

---

**开始使用**: `./auto-install.sh` 🚀