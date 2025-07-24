import { githubService } from '@/lib/github-service';

export async function readJson(path: string) {
  const { content } = await githubService.getFileContent(path);
  return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
}

export async function writeJson(
  path: string,
  data: any,
  message: string
) {
  const { sha } = await githubService.getFileContent(path);
  await githubService.updateFile({
    path,
    content: JSON.stringify(data, null, 2),
    sha,
    message
  });
}
