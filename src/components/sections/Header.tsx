'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';
import { HeaderData, isTextLogo } from '@/types/lp-config';
import { sectionDefaults } from '@/config/sections';
import { typography } from '@/config/typography';

interface HeaderProps {
  data: HeaderData;
}

function Header({ data }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const containerStyle = {
    ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
    ...(data.textColor && { color: data.textColor }),
  };

  return (
    <header
      className={cn(sectionDefaults.header.classes, 'sticky top-0 z-50')}
      style={containerStyle}
    >
      <div className={cn(sectionDefaults.header.container, sectionDefaults.header.grid)}>
        <div className={sectionDefaults.header.logoContainer}>
          <span className="inline-block cursor-default">
            {isTextLogo(data.logo) ? (
              <div>
                <div className={cn(typography.logoText.classes)} style={{ color: data.textColor }}>
                  {data.logo.text}
                </div>
                {data.logo.subtitle && (
                  <div className={cn(typography.logoSubtitle.classes)} style={{ color: data.textColor }}>
                    {data.logo.subtitle}
                  </div>
                )}
              </div>
            ) : (
              <SmartImage
                src={data.logo.src}
                alt={data.logo.alt}
                width={200}
                height={60}
                className="h-12 md:h-14 w-auto"
                priority
              />
            )}
          </span>
        </div>

        <div className={sectionDefaults.header.navContainer}>
          <nav className="hidden md:flex items-center gap-6">
            {data.navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={cn(typography.navLink.classes, 'hover:opacity-70 transition-opacity')}
                style={{ color: data.textColor }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {data.phone && (
            <a
              href={data.phone.link}
              className={cn(
                typography.navLink.classes,
                'font-bold hover:opacity-70 transition-opacity',
                'hidden md:inline-block'
              )}
              style={{ color: data.textColor }}
            >
              {data.phone.display}
            </a>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            style={{ color: data.textColor }}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: data.textColor + '20', ...containerStyle }}>
          <nav className="container-lp py-4 space-y-3">
            {data.navigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block py-2 text-center"
                style={{ color: data.textColor }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {data.phone && (
              <a
                href={data.phone.link}
                className="block py-2 text-center font-bold"
                style={{ color: data.textColor }}
              >
                {data.phone.display}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
