'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export function BreadcrumbNav({ items, currentPage }: BreadcrumbNavProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                <svg 
                  className="flex-shrink-0 h-5 w-5 text-gray-300 mr-4" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <Link
                href={item.href}
                className="text-gray-400 hover:text-gray-500 text-sm font-medium"
              >
                {item.label}
              </Link>
            </div>
          </li>
        ))}
        
        {/* Página atual */}
        <li>
          <div className="flex items-center">
            <svg 
              className="flex-shrink-0 h-5 w-5 text-gray-300 mr-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-500 font-medium text-sm">
              {currentPage}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}
