import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Extrair clientId da URL
  const pathname = request.nextUrl.pathname;
  const clientMatch = pathname.match(/^\/dashboard\/([^\/]+)/);
  
  if (!clientMatch) {
    // Se não é uma rota de cliente, permitir (ex: /dashboard/login)
    return NextResponse.next();
  }
  
  const clientId = clientMatch[1];
  
  // Verificar autenticação
  const isAuthenticated = await requireAuth(request, clientId);
  
  if (!isAuthenticated) {
    // Redirecionar para login
    const loginUrl = new URL('/dashboard/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
