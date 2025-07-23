import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github-service';

interface SaveAndDeployRequest {
  type: 'lp' | 'tracking' | 'domain';
  lpId?: string;
  data: any;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { client: string } }
) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const client = params.client;
  const { type, lpId, data }: SaveAndDeployRequest = await request.json();

  if (!client || typeof client !== 'string') {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  if (!type || !data) {
    return NextResponse.json({ error: 'Type and data are required' }, { status: 400 });
  }

  try {
    let filePath: string;
    let fileContent: string;
    let commitMessage: string;

    switch (type) {
      case 'lp':
        if (!lpId) {
          return NextResponse.json(
            { error: 'LP ID is required for LP updates' },
            { status: 400 }
          );
        }
        filePath = `data/${client}/lp-${lpId}/lp.json`;
        fileContent = JSON.stringify(data, null, 2);
        commitMessage = `Dashboard update: LP ${lpId} content by ${client}`;
        break;
      case 'tracking':
        if (!lpId) {
          return NextResponse.json(
            { error: 'LP ID is required for tracking updates' },
            { status: 400 }
          );
        }
        filePath = `data/${client}/lp-${lpId}/tracking.json`;
        fileContent = JSON.stringify(data, null, 2);
        commitMessage = `Dashboard update: LP ${lpId} tracking by ${client}`;
        break;
      case 'domain':
        filePath = `data/${client}/domain.json`;
        fileContent = JSON.stringify(data, null, 2);
        commitMessage = `Dashboard update: Domain settings by ${client}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
    }

    const result = await githubService.updateFile({
      path: filePath,
      content: fileContent,
      message: commitMessage,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Changes deployed successfully',
        commit: result.commit,
        deployUrl: `https://lp-factory-v2-robusto.vercel.app`,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error, message: 'Failed to deploy changes' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Save and deploy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: 'Failed to save and deploy changes' },
      { status: 500 }
    );
  }
}
