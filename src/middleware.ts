import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar se é rota protegida do dashboard
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/login')) {
    // Extrair clientId da URL
    const clientMatch = pathname.match(/^\/dashboard\/([^\/]+)/);

    if (clientMatch) {
      const clientId = clientMatch[1];
      const sessionCookie = request.cookies.get('dashboard-session');

      // Verificar se tem sessão e se corresponde ao cliente
      if (!sessionCookie || sessionCookie.value !== clientId) {
        // Redirecionar para login
        const loginUrl = new URL('/dashboard/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Headers de performance
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
