// src/lib/persist.ts
import { githubService } from '@/lib/github-service';

export async function readJson(path: string) {
  const file = await githubService.getFileContent(path);
  if (!file || !file.content) {
    throw new Error(`Arquivo não encontrado: ${path}`);
  }
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

export async function writeJson(
  path: string,
  data: any,
  message: string
) {
  await githubService.updateFile({
    path,
    content: JSON.stringify(data, null, 2),
    message
  });
}
