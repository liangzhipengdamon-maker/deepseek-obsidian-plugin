import { Vault } from 'obsidian';

interface DeepSeekSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class DeepSeekService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private temperature: number;
  private conversationHistory: Message[] = [];
  private vault: Vault;
  private cacheFileName: string = 'deepseek-chat-cache.json';

  constructor(settings: DeepSeekSettings, vault: Vault) {
    this.apiKey = settings.apiKey;
    this.apiUrl = settings.apiUrl;
    this.model = settings.model;
    this.temperature = settings.temperature;
    this.vault = vault;
    
    // Load conversation history from cache on initialization
    this.loadCache();
  }

  async chat(userMessage: string, knowledgeContext?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured. Please set it in plugin settings.');
    }

    const messages: Message[] = [...this.conversationHistory];
    
    if (knowledgeContext) {
      messages.push({
        role: 'system',
        content: `You are a helpful assistant. Here is some context from the user's knowledge base:\n\n${knowledgeContext}`
      });
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      // Prepare request payload
      const payload: any = {
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: 2048,
        stream: false  // We'll handle streaming separately
      };

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
          //'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
        // Note: Removing timeout for compatibility, will handle manually if needed
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your DeepSeek API key in settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();

      let assistantMessage = '';
      
      // Handle both regular and reasoning mode responses
      if (data.choices[0].message.reasoning_content) {
        // If there's reasoning content, include it
        assistantMessage = data.choices[0].message.reasoning_content + '\n\n' + data.choices[0].message.content;
      } else {
        // Regular response
        assistantMessage = data.choices[0].message.content;
      }
      
      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Save to cache
      await this.saveCache();

      return assistantMessage;
    } catch (error: any) {
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }

  // New method for streaming chat with thinking process
  async streamChat(
    userMessage: string,
    onChunkReceived: (chunk: { content: string; reasoningContent: string; isFinal: boolean }) => void,
    knowledgeContext?: string
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured. Please set it in plugin settings.');
    }

    const messages: Message[] = [...this.conversationHistory];
    
    if (knowledgeContext) {
      messages.push({
        role: 'system',
        content: `You are a helpful assistant. Here is some context from the user's knowledge base:\n\n${knowledgeContext}`
      });
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      // Prepare request payload with streaming enabled
      const payload: any = {
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: 2048,
        stream: true
      };

      // Use fetch with streaming support
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(payload)
        // Note: Removing timeout for compatibility, will handle manually if needed
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your DeepSeek API key in settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Process the streaming response using ReadableStream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullContent = '';
      let fullReasoningContent = '';
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Stream finished
            onChunkReceived({
              content: '',
              reasoningContent: '',
              isFinal: true
            });
            
            // Add to conversation history
            this.conversationHistory.push({
              role: 'user',
              content: userMessage
            });
            this.conversationHistory.push({
              role: 'assistant',
              content: fullReasoningContent ? fullReasoningContent + '\n\n' + fullContent : fullContent
            });

            // Save to cache
            await this.saveCache();
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // Stream finished
                onChunkReceived({
                  content: '',
                  reasoningContent: '',
                  isFinal: true
                });
                
                // Add to conversation history
                this.conversationHistory.push({
                  role: 'user',
                  content: userMessage
                });
                this.conversationHistory.push({
                  role: 'assistant',
                  content: fullReasoningContent ? fullReasoningContent + '\n\n' + fullContent : fullContent
                });

                // Save to cache
                await this.saveCache();
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const choice = parsed.choices[0];
                const delta = choice.delta;
                
                if (delta) {
                  if (delta.content) {
                    fullContent += delta.content;
                  }
                  if (delta.reasoning_content) {
                    fullReasoningContent += delta.reasoning_content;
                  }
                  
                  // Send incremental update
                  onChunkReceived({
                    content: delta.content || '',
                    reasoningContent: delta.reasoning_content || '',
                    isFinal: false
                  });
                }
              } catch (parseError) {
                // Ignore parsing errors for SSE protocol
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      throw new Error(`Streaming error: ${error.message}`);
    }
  }

  async analyzeContent(content: string): Promise<string> {
    const prompt = `Please analyze the following content and provide detailed insights, key points, and recommendations:\n\n${content}`;
    return this.chat(prompt);
  }

  async summarizeContent(content: string): Promise<string> {
    const prompt = `Please provide a concise and clear summary of the following content:\n\n${content}`;
    return this.chat(prompt);
  }

  async enhanceContent(content: string): Promise<string> {
    const prompt = `Please improve and enhance the following content. Make it clearer, more structured, and more compelling:\n\n${content}`;
    return this.chat(prompt);
  }

  async clearHistory(): Promise<void> {
    this.conversationHistory = [];
    await this.saveCache();
  }

  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  setSettings(settings: DeepSeekSettings): void {
    this.apiKey = settings.apiKey;
    this.apiUrl = settings.apiUrl;
    this.model = settings.model;
    this.temperature = settings.temperature;
  }

  private async loadCache(): Promise<void> {
    try {
      // Check if cache file exists
      const files = this.vault.getFiles();
      const cacheFile = files.find(file => file.name === this.cacheFileName);
      
      if (cacheFile) {
        // Read cache file
        const data = await this.vault.read(cacheFile);
        const cache = JSON.parse(data);
        this.conversationHistory = cache.conversationHistory || [];
        console.log('Loaded conversation history from cache');
      } else {
        console.log('No existing cache found, starting fresh conversation');
        this.conversationHistory = [];
      }
    } catch (error) {
      console.error('Failed to load cache, starting fresh conversation:', error);
      this.conversationHistory = [];
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const cache = {
        conversationHistory: this.conversationHistory,
        lastUpdated: new Date().toISOString()
      };
      
      // Convert to JSON string
      const cacheData = JSON.stringify(cache, null, 2);
      
      // Save to vault (this will create or overwrite the file)
      await this.vault.adapter.write(this.cacheFileName, cacheData);
      console.log('Saved conversation history to cache');
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }
}