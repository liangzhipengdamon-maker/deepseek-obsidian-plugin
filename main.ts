import { App, Plugin, PluginSettingTab, Setting, Notice, TextAreaComponent, ButtonComponent } from 'obsidian';
import { DeepSeekService } from './src/services/deepseekService';
import { KnowledgeBaseService } from './src/services/knowledgeBaseService';
import { ChatModal } from './src/modals/ChatModal';

interface DeepSeekPluginSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  knowledgeBasePath: string;
}

const DEFAULT_SETTINGS: DeepSeekPluginSettings = {
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-reasoner',
  temperature: 0.7,
  knowledgeBasePath: '/Users/Zhuanz/Documents/Obsidian-KB'
};

export default class DeepSeekPlugin extends Plugin {
  settings: DeepSeekPluginSettings;
  deepSeekService: DeepSeekService;
  knowledgeBaseService: KnowledgeBaseService;
  chatModal: ChatModal | null = null;

  async onload() {
    await this.loadSettings();
    
    this.deepSeekService = new DeepSeekService(this.settings, this.app.vault);
    this.knowledgeBaseService = new KnowledgeBaseService(this.app.vault);

    // 命令面板：打开AI对话框
    this.addCommand({
      id: 'deepseek-open-chat',
      name: 'Open DeepSeek Chat',
      callback: () => {
        // 确保使用最新的设置
        this.deepSeekService.setSettings(this.settings);
        this.openChatModal();
      }
    });

    // 命令面板：分析当前笔记
    this.addCommand({
      id: 'deepseek-analyze-note',
      name: 'Analyze Current Note',
      editorCallback: async (editor, ctx) => {
        // 确保使用最新的设置
        this.deepSeekService.setSettings(this.settings);
        const content = editor.getDoc().getValue();
        new Notice('Analyzing note...');
        try {
          const analysis = await this.deepSeekService.analyzeContent(content);
          new Notice('Analysis complete! Check console for details.');
          console.log('Analysis:', analysis);
        } catch (error) {
          new Notice(`Error: ${error.message}`);
        }
      }
    });

    // 命令面板：总结当前笔记
    this.addCommand({
      id: 'deepseek-summarize-note',
      name: 'Summarize Current Note',
      editorCallback: async (editor, ctx) => {
        // 确保使用最新的设置
        this.deepSeekService.setSettings(this.settings);
        const content = editor.getDoc().getValue();
        new Notice('Summarizing note...');
        try {
          const summary = await this.deepSeekService.summarizeContent(content);
          new Notice(summary);
        } catch (error) {
          new Notice(`Error: ${error.message}`);
        }
      }
    });

    // 命令面板：增强笔记内容
    this.addCommand({
      id: 'deepseek-enhance-note',
      name: 'Enhance Current Note',
      editorCallback: async (editor, ctx) => {
        // 确保使用最新的设置
        this.deepSeekService.setSettings(this.settings);
        const content = editor.getDoc().getValue();
        new Notice('Enhancing content...');
        try {
          const enhanced = await this.deepSeekService.enhanceContent(content);
          new Notice('Enhancement complete! Check console for details.');
          console.log('Enhanced content:', enhanced);
        } catch (error) {
          new Notice(`Error: ${error.message}`);
        }
      }
    });

    // 右键菜单：分析选中文本
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor, ctx) => {
        menu.addItem((item) => {
          item
            .setTitle('DeepSeek: Analyze Selection')
            .setIcon('sparkles')
            .onClick(async () => {
              // 确保使用最新的设置
              this.deepSeekService.setSettings(this.settings);
              const selection = editor.getSelection();
              if (selection) {
                new Notice('Analyzing selection...');
                try {
                  const analysis = await this.deepSeekService.analyzeContent(selection);
                  new Notice(analysis);
                } catch (error) {
                  new Notice(`Error: ${error.message}`);
                }
              } else {
                new Notice('Please select some text first');
              }
            });
        });

        menu.addItem((item) => {
          item
            .setTitle('DeepSeek: Search Knowledge Base')
            .setIcon('search')
            .onClick(async () => {
              // 确保使用最新的设置
              this.deepSeekService.setSettings(this.settings);
              const selection = editor.getSelection();
              if (selection) {
                new Notice('Searching knowledge base...');
                try {
                  const results = await this.knowledgeBaseService.search(selection);
                  new Notice(`Found ${results.length} matching notes`);
                  console.log('Search results:', results);
                } catch (error) {
                  new Notice(`Error: ${error.message}`);
                }
              } else {
                new Notice('Please select some text to search');
              }
            });
        });
      })
    );

    // 添加设置选项卡
    this.addSettingTab(new DeepSeekSettingTab(this.app, this));

    new Notice('DeepSeek Plugin loaded!');
  }

  onunload() {
    // Close chat modal if it's open
    if (this.chatModal) {
      this.chatModal.close();
    }
    new Notice('DeepSeek Plugin unloaded.');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // 当设置保存时，更新DeepSeekService的设置
    if (this.deepSeekService) {
      this.deepSeekService.setSettings(this.settings);
    }
  }

  private openChatModal() {
    // Close existing chat modal if open
    if (this.chatModal) {
      this.chatModal.close();
    }
    
    // Create and open new chat modal
    this.chatModal = new ChatModal(this.app, this.deepSeekService, this.knowledgeBaseService);
    this.chatModal.open();
  }
}

class DeepSeekSettingTab extends PluginSettingTab {
  plugin: DeepSeekPlugin;

  constructor(app: App, plugin: DeepSeekPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'DeepSeek API Settings' });

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Your DeepSeek API key (required)')
      .addText((text) =>
        text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('API URL')
      .setDesc('DeepSeek API endpoint')
      .addText((text) =>
        text
          .setPlaceholder('https://api.deepseek.com/v1')
          .setValue(this.plugin.settings.apiUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Model')
      .setDesc('DeepSeek model to use')
      .addText((text) =>
        text
          .setPlaceholder('deepseek-reasoner')
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Temperature')
      .setDesc('Model temperature (0-1, lower = more deterministic)')
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.1)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Knowledge Base Path')
      .setDesc('Path to your Obsidian vault')
      .addText((text) =>
        text
          .setPlaceholder('/Users/Zhuanz/Documents/Obsidian-KB')
          .setValue(this.plugin.settings.knowledgeBasePath)
          .onChange(async (value) => {
            this.plugin.settings.knowledgeBasePath = value;
            await this.plugin.saveSettings();
          })
      );
  }
}