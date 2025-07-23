interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface UpdateFileParams {
  path: string;
  content: string;
  message: string;
}

interface GitHubResponse {
  success: boolean;
  commit?: string;
  error?: string;
}

class GitHubService {
  private config: GitHubConfig;
  private baseUrl = 'https://api.github.com';

  constructor() {
    this.config = {
      token: process.env.GITHUB_TOKEN || '',
      owner: process.env.GITHUB_REPO_OWNER || '',
      repo: process.env.GITHUB_REPO_NAME || '',
    };

    if (!this.config.token || !this.config.owner || !this.config.repo) {
      console.error('GitHub configuration missing. Check environment variables.');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async getFileContent(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await this.makeRequest(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`
      );

      return {
        content: Buffer.from(response.content, 'base64').toString('utf-8'),
        sha: response.sha,
      };
    } catch {
      return null;
    }
  }

  async updateFile(params: UpdateFileParams): Promise<GitHubResponse> {
    const { path, content, message } = params;

    try {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const existingFile = await this.getFileContent(path);
          const requestBody: any = {
            message,
            content: Buffer.from(content).toString('base64'),
            branch: 'main',
          };

          if (existingFile) {
            requestBody.sha = existingFile.sha;
          }

          const response = await this.makeRequest(
            `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
            {
              method: 'PUT',
              body: JSON.stringify(requestBody),
            }
          );

          return {
            success: true,
            commit: response.commit.sha,
          };
        } catch (error) {
          console.error(`GitHub API attempt ${attempt} failed:`, error);
          if (attempt === 3) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }

      return { success: false, error: 'All retry attempts failed' };
    } catch (error) {
      console.error('GitHub service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.makeRequest(`/repos/${this.config.owner}/${this.config.repo}`);
      return true;
    } catch (error) {
      console.error('GitHub connection validation failed:', error);
      return false;
    }
  }
}

export const githubService = new GitHubService();
