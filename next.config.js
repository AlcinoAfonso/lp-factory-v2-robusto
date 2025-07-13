/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

function loadClientsFromFolders() {
  const appDir = path.join(process.cwd(), 'src/app');
  const clients = [];
  try {
    const folders = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !['components', 'dashboard-lps', '[...slug]'].includes(dirent.name));
    
    for (const folder of folders) {
      const domainFile = path.join(appDir, folder.name, 'domain.json');
      if (fs.existsSync(domainFile)) {
        try {
          const config = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
          if (config.active && config.domain) {
            clients.push({
              folder: folder.name,
              domain: config.domain,
            });
          }
        } catch (error) {
          console.warn(`Erro ao ler ${domainFile}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.warn('Erro ao escanear pastas:', error.message);
  }
  return clients;
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
    formats: ['image/webp'],
  },

  async rewrites() {
    const clients = loadClientsFromFolders();
    
    const clientRewrites = clients.map(({ domain, folder }) => ({
      source: '/',
      has: [{ type: 'host', value: domain }],
      destination: '/homepage',
    }));

    console.log(`\n🔗 Domínios configurados: ${clients.length}`);
    clients.forEach(({ folder, domain }) => {
      console.log(`   ✅ ${domain} → [...slug] (${folder})`);
    });
    console.log('');
    
    return clientRewrites;
  },

  async redirects() { 
    return []; 
  },
};

module.exports = nextConfig;
