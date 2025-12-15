# DeepSeek Obsidian Plugin

Welcome to the DeepSeek Obsidian Plugin documentation!

This plugin integrates DeepSeek AI directly into Obsidian, providing you with powerful AI assistance for managing your knowledge base.

## Features

- 🤖 **AI Chat Interface** - Copilot-style multi-turn conversation with streaming responses and thinking process visualization
- 🔍 **Knowledge Base Search** - AI automatically queries your notes for context
- 📊 **Note Analysis** - Analyze, summarize, and enhance your note content
- ⚡ **Multiple Access Methods** - Command palette, right-click menu, sidebar panel, and chat dialog
- 🔧 **Flexible Configuration** - Customizable API Key, model, temperature, and more
- 🔒 **Privacy & Security** - Read-only access to your knowledge base with no data uploaded
- 💾 **Persistent Conversations** - Conversation history preserved across Obsidian restarts

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/liangzhipengdamon-maker/deepseek-obsidian-plugin.git
   ```

2. Navigate to the project directory:
   ```
   cd deepseek-obsidian-plugin
   ```

3. Run the installation script:
   ```
   chmod +x auto-install.sh
   ./auto-install.sh
   ```

4. Open Obsidian and enable the plugin in Settings → Community Plugins

5. Configure your DeepSeek API Key in the plugin settings

## Usage

After installation, you can access the DeepSeek AI Assistant through multiple entry points:

- **Command Palette**: Press `Cmd+P` and search for "DeepSeek"
- **Right-click Menu**: Select text and right-click to access analysis options
- **Chat Dialog**: Open the chat interface for conversational interactions
- **Sidebar Panel**: Access AI tools through the sidebar

## Configuration

The plugin offers several configuration options:

- **API Key**: Your DeepSeek API key (required)
- **API URL**: The DeepSeek API endpoint (default: https://api.deepseek.com/v1)
- **Model**: The DeepSeek model to use (default: deepseek-reasoner)
- **Temperature**: Controls randomness in responses (0.0-1.0)
- **Knowledge Base Path**: Path to your Obsidian vault

## Privacy & Security

This plugin prioritizes your privacy and security:

- All API calls are made locally from your machine
- Your knowledge base content is only used for context and is not stored or transmitted beyond the API call
- API keys are stored locally in Obsidian's secure configuration
- The plugin operates in read-only mode and does not modify your notes

## Support

For support, please [open an issue](https://github.com/liangzhipengdamon-maker/deepseek-obsidian-plugin/issues) on GitHub.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.