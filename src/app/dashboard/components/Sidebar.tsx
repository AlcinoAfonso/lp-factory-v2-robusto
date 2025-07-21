'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  clientId: string;
  clientData: {
    name?: string;
    domain?: string;
    active?: boolean;
    homepage?: string;
  };
}

export function Sidebar({ clientId, clientData }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    {
      name: 'Dashboard',
      href: `/dashboard/${clientId}`,
      icon: HomeIcon,
    },
    {
      name: 'Dados da Conta',
      href: `/dashboard/${clientId}/conta`,
      icon: CogIcon,
    },
    {
      name: 'Minhas LPs',
      href: `/dashboard/${clientId}/lps`,
      icon: DocumentIcon,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/dashboard/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/dashboard/login');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LP</span>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">LP Factory</h2>
            <p className="text-xs text-gray-500">Dashboard Cliente</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-1">{clientData.name || clientId}</h3>
        {clientData.domain && <p className="text-xs text-gray-500">{clientData.domain}</p>}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-blue-500' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogoutIcon className="mr-3 h-5 w-5 text-gray-400" />
          Sair
        </button>
      </div>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function CogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}
