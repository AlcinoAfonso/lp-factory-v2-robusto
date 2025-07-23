interface SaveAndDeployOptions {
  client: string;
  type: 'lp' | 'tracking' | 'domain';
  lpId?: string;
  data: any;
}

export async function saveAndDeploy(options: SaveAndDeployOptions) {
  const { client, type, lpId, data } = options;

  const response = await fetch(`/api/dashboard/${client}/save-and-deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, lpId, data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save and deploy');
  }

  return response.json();
}

export function createDebouncedSaveAndDeploy(delay = 3000) {
  let timeoutId: NodeJS.Timeout;

  return function (options: SaveAndDeployOptions) {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await saveAndDeploy(options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}
