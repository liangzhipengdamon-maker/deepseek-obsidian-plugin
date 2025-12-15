import { App, Component, Notice } from 'obsidian';
import { DeepSeekService } from '../services/deepseekService';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';

export class ChatModal extends Component {
  private app: App;
  private deepSeekService: DeepSeekService;
  private knowledgeBaseService: KnowledgeBaseService;
  private conversationContainer: HTMLElement;
  private inputField: HTMLTextAreaElement;
  private isLoading: boolean = false;
  private chatContainer: HTMLElement;
  private currentAssistantMessage: HTMLElement | null = null;
  private currentReasoningContainer: HTMLElement | null = null;

  constructor(
    app: App,
    deepSeekService: DeepSeekService,
    knowledgeBaseService: KnowledgeBaseService
  ) {
    super();
    this.app = app;
    this.deepSeekService = deepSeekService;
    this.knowledgeBaseService = knowledgeBaseService;
  }

  open() {
    // Create the floating chat window
    this.createFloatingChatWindow();
    // Load conversation history
    this.loadConversationHistory();
  }

  close() {
    if (this.chatContainer) {
      this.chatContainer.remove();
    }
    this.onClose();
  }

  private createFloatingChatWindow() {
    // Create the floating chat container
    this.chatContainer = this.app.workspace.containerEl.createEl('div', { cls: 'deepseek-floating-chat' });
    this.chatContainer.style.position = 'fixed';
    this.chatContainer.style.bottom = '20px';
    this.chatContainer.style.right = '20px';
    this.chatContainer.style.width = '400px';
    this.chatContainer.style.height = '500px';
    this.chatContainer.style.backgroundColor = 'var(--background-primary)';
    this.chatContainer.style.border = '1px solid var(--background-modifier-border)';
    this.chatContainer.style.borderRadius = '8px';
    this.chatContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    this.chatContainer.style.display = 'flex';
    this.chatContainer.style.flexDirection = 'column';
    this.chatContainer.style.zIndex = '10000';
    this.chatContainer.style.resize = 'both';
    this.chatContainer.style.overflow = 'hidden';
    this.chatContainer.style.minWidth = '300px';
    this.chatContainer.style.minHeight = '300px';

    // Create header with title and close button
    const header = this.chatContainer.createEl('div', { cls: 'deepseek-chat-header' });
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '10px 15px';
    header.style.borderBottom = '1px solid var(--background-modifier-border)';
    header.style.cursor = 'move';
    header.style.userSelect = 'none';

    const title = header.createEl('div', { text: 'DeepSeek AI Assistant' });
    title.style.fontWeight = 'bold';
    title.style.fontSize = '14px';

    const closeButton = header.createEl('button', { text: '×' });
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.onclick = () => this.close();

    // Make the header draggable
    this.makeDraggable(this.chatContainer, header);

    // Conversation container
    this.conversationContainer = this.chatContainer.createEl('div', {
      cls: 'deepseek-conversation-container'
    });
    this.conversationContainer.style.flex = '1';
    this.conversationContainer.style.overflowY = 'auto';
    this.conversationContainer.style.padding = '15px';
    this.conversationContainer.style.backgroundColor = 'var(--background-secondary)';
    this.conversationContainer.style.display = 'flex';
    this.conversationContainer.style.flexDirection = 'column';

    // Input area
    const inputArea = this.chatContainer.createEl('div', {
      cls: 'deepseek-input-area'
    });
    inputArea.style.padding = '15px';
    inputArea.style.borderTop = '1px solid var(--background-modifier-border)';
    inputArea.style.display = 'flex';
    inputArea.style.flexDirection = 'column';
    inputArea.style.gap = '10px';

    // Textarea
    this.inputField = inputArea.createEl('textarea', {
      cls: 'deepseek-input-field'
    });
    this.inputField.placeholder = 'Ask anything... (Enter to send, Shift+Enter for new line)';
    this.inputField.style.padding = '10px';
    this.inputField.style.borderRadius = '4px';
    this.inputField.style.border = '1px solid var(--background-modifier-border)';
    this.inputField.style.minHeight = '80px';
    this.inputField.style.fontFamily = 'var(--font-monospace)';
    this.inputField.style.fontSize = '13px';
    this.inputField.style.resize = 'vertical';
    this.inputField.style.flex = '1';

    // Button container
    const buttonContainer = inputArea.createEl('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'flex-end';

    // Send button
    const sendBtn = buttonContainer.createEl('button', {
      text: 'Send',
      cls: 'deepseek-send-btn'
    });
    sendBtn.style.padding = '8px 16px';
    sendBtn.style.cursor = 'pointer';
    sendBtn.style.backgroundColor = 'var(--interactive-accent)';
    sendBtn.style.color = 'var(--text-on-accent)';
    sendBtn.style.border = 'none';
    sendBtn.style.borderRadius = '4px';
    sendBtn.onclick = () => this.sendMessage();

    // Clear button
    const clearBtn = buttonContainer.createEl('button', {
      text: 'Clear',
      cls: 'deepseek-clear-btn'
    });
    clearBtn.style.padding = '8px 16px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.backgroundColor = 'var(--background-modifier-border)';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.onclick = async () => {
      await this.deepSeekService.clearHistory();
      this.conversationContainer.empty();
      new Notice('Conversation cleared');
    };

    // Keyboard shortcuts - Enter to send, Shift+Enter for new line
    this.inputField.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
      // Shift+Enter will create a new line (default behavior)
    };
  }

  private makeDraggable(element: HTMLElement, handle: HTMLElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const dragMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      // Get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e: MouseEvent) => {
      e.preventDefault();
      // Calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position:
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    };

    const closeDragElement = () => {
      // Stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };

    handle.onmousedown = dragMouseDown;
  }

  private loadConversationHistory() {
    const history = this.deepSeekService.getHistory();
    for (const msg of history) {
      this.addMessageToChat(
        msg.role === 'user' ? 'You' : 'DeepSeek',
        msg.content,
        msg.role as 'user' | 'assistant'
      );
    }
  }

  private async sendMessage() {
    const userMessage = this.inputField.value.trim();
    if (!userMessage || this.isLoading) return;

    this.inputField.value = '';
    this.addMessageToChat('You', userMessage, 'user');

    this.isLoading = true;

    try {
      // Get knowledge base context
      const context = await this.knowledgeBaseService.getKnowledgeContext(userMessage);
      
      // Use streaming for better UX with thinking process
      await this.streamMessage(userMessage, context);
    } catch (error: any) {
      this.addMessageToChat('Error', error.message, 'error');
    } finally {
      this.isLoading = false;
    }

    // Scroll to bottom
    this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;
  }

  private async streamMessage(userMessage: string, knowledgeContext?: string) {
    // Create placeholder for assistant message
    this.currentAssistantMessage = this.addMessageToChat('DeepSeek', '', 'assistant');
    this.currentReasoningContainer = null;
    
    let accumulatedContent = '';
    let accumulatedReasoning = '';

    try {
      await this.deepSeekService.streamChat(
        userMessage,
        (chunk) => {
          if (chunk.isFinal) {
            // Final update, scroll to bottom
            this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;
            return;
          }

          // Update content
          if (chunk.content) {
            accumulatedContent += chunk.content;
            if (this.currentAssistantMessage) {
              const contentEl = this.currentAssistantMessage.querySelector('.deepseek-message-content');
              if (contentEl) {
                contentEl.textContent = accumulatedContent;
              }
            }
          }

          // Update reasoning content
          if (chunk.reasoningContent) {
            accumulatedReasoning += chunk.reasoningContent;
            if (!this.currentReasoningContainer && this.currentAssistantMessage) {
              // Create reasoning container if it doesn't exist
              this.currentReasoningContainer = this.currentAssistantMessage.createEl('div', {
                cls: 'deepseek-reasoning-container'
              });
              this.currentReasoningContainer.style.marginTop = '10px';
              this.currentReasoningContainer.style.padding = '10px';
              this.currentReasoningContainer.style.backgroundColor = 'var(--background-modifier-border-hover)';
              this.currentReasoningContainer.style.borderRadius = '4px';
              this.currentReasoningContainer.style.fontSize = '12px';
              this.currentReasoningContainer.style.fontStyle = 'italic';

              const reasoningTitle = this.currentReasoningContainer.createEl('strong');
              reasoningTitle.textContent = 'Thinking process:';
              reasoningTitle.style.display = 'block';
              reasoningTitle.style.marginBottom = '5px';
            }

            if (this.currentReasoningContainer) {
              const reasoningContentEl = this.currentReasoningContainer.querySelector('.deepseek-reasoning-content');
              if (!reasoningContentEl) {
                const newReasoningContentEl = this.currentReasoningContainer.createEl('div', {
                  cls: 'deepseek-reasoning-content'
                });
                newReasoningContentEl.style.whiteSpace = 'pre-wrap';
                newReasoningContentEl.textContent = accumulatedReasoning;
              } else {
                reasoningContentEl.textContent = accumulatedReasoning;
              }
            }
          }

          // Scroll to bottom as content arrives
          this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;
        },
        knowledgeContext
      );
    } catch (error: any) {
      this.addMessageToChat('Error', error.message, 'error');
    } finally {
      // Reset current message references
      this.currentAssistantMessage = null;
      this.currentReasoningContainer = null;
      this.isLoading = false;
    }
  }

  private addMessageToChat(
    sender: string,
    message: string,
    type: 'user' | 'assistant' | 'error'
  ): HTMLElement {
    const messageEl = this.conversationContainer.createEl('div', {
      cls: `deepseek-message deepseek-message-${type}`
    });
    messageEl.style.marginBottom = '12px';
    messageEl.style.padding = '10px';
    messageEl.style.borderRadius = '4px';
    messageEl.style.lineHeight = '1.5';
    messageEl.style.alignSelf = type === 'user' ? 'flex-end' : 'flex-start';
    messageEl.style.maxWidth = '80%';

    if (type === 'user') {
      messageEl.style.backgroundColor = 'var(--interactive-accent)';
      messageEl.style.color = 'var(--text-on-accent)';
    } else if (type === 'assistant') {
      messageEl.style.backgroundColor = 'var(--background-primary)';
      messageEl.style.border = '1px solid var(--background-modifier-border)';
    } else {
      messageEl.style.backgroundColor = 'var(--text-error)';
      messageEl.style.color = 'white';
    }

    const senderEl = messageEl.createEl('strong');
    senderEl.textContent = sender + ':';
    senderEl.style.display = 'block';
    senderEl.style.marginBottom = '6px';

    const contentEl = messageEl.createEl('div', {
      cls: 'deepseek-message-content'
    });
    contentEl.textContent = message;
    contentEl.style.whiteSpace = 'pre-wrap';
    contentEl.style.wordBreak = 'break-word';

    // Scroll to bottom after adding message
    this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;
    
    return messageEl;
  }

  onClose() {
    // Cleanup if needed
  }
}