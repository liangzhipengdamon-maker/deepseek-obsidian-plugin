import { Vault, TFile } from 'obsidian';

interface SearchResult {
  file: TFile;
  content: string;
  relevanceScore: number;
  context: string;
}

export class KnowledgeBaseService {
  private vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const files = this.vault.getMarkdownFiles();
    const results: SearchResult[] = [];

    const queryTerms = query.toLowerCase().split(/\s+/);

    for (const file of files) {
      const content = await this.vault.cachedRead(file);
      let relevanceScore = 0;

      // Calculate relevance score based on term frequency
      for (const term of queryTerms) {
        const regex = new RegExp(term, 'gi');
        const matches = content.match(regex) || [];
        relevanceScore += matches.length;
      }

      if (relevanceScore > 0) {
        const context = this.extractContext(content, query, 200);
        results.push({
          file,
          content,
          relevanceScore,
          context
        });
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results.slice(0, limit);
  }

  private extractContext(content: string, query: string, contextLength: number): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) {
      return content.substring(0, contextLength);
    }

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(content.length, index + contextLength / 2);
    return '...' + content.substring(start, end) + '...';
  }

  async getFileContent(file: TFile): Promise<string> {
    return this.vault.cachedRead(file);
  }

  getMarkdownFiles(): TFile[] {
    return this.vault.getMarkdownFiles();
  }

  async getKnowledgeContext(query: string, limit: number = 3): Promise<string> {
    const results = await this.search(query, limit);
    
    if (results.length === 0) {
      return '';
    }

    return results
      .map((result, index) => {
        return `[${index + 1}] From file: "${result.file.basename}"\n${result.context}`;
      })
      .join('\n\n---\n\n');
  }
}
