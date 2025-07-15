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

  // \u2705 OTIMIZA\u00C7\u00D5ES DE BUILD
  experimental: {
    optimizeCss: true, // Minifica CSS
    legacyBrowsers: false, // Remove polyfills desnecess\u00E1rios
  },

  // \u2705 OTIMIZA\u00C7\u00C3O DE FONTES
  optimizeFonts: true,

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
      {
        protocol: 'https',
        hostname: 'img.youtube.com', // \u2705 Adicionado para thumbnails
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
  
  // \u2705 HEADERS DE PERFORMANCE
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
