'use client';

import React from 'react';
import dynamic from 'next/dynamic';
// Imports diretos - sem dynamic()
import Header from './sections/Header';
import Hero from './sections/Hero';
import Benefits from './sections/Benefits';
import Services from './sections/Services';
import Testimonials from './sections/Testimonials';
import FAQ from './sections/FAQ';
import About from './sections/About';
import Steps from './sections/Steps';
import Technology from './sections/Technology';
import CTAFinal from './sections/CTAFinal';
import Footer from './sections/Footer';
import Gallery from './sections/Gallery';
import Pricing from './sections/Pricing';
import Contact from './sections/Contact';

// Tracking Manager com dynamic import para otimização
const TrackingManager = dynamic(() => import('./tracking/TrackingManager'), { ssr: false });

import {
  LandingPageData,
  SectionData,
  HeaderData,
  HeroData,
  BenefitsData,
  ServicesData,
  TestimonialsData,
  StepsData,
  TechnologyData,
  AboutData,
  FAQData,
  CTAFinalData,
  FooterData,
} from '@/types/lp-config';

interface LandingPageProps {
  data: LandingPageData;
  clientName?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ data, clientName }) => {
  const renderSection = (section: SectionData, index: number) => {
    const key = `${section.type}-${index}`;

    switch (section.type) {
      case 'header':
        return <Header key={key} data={section as HeaderData} />;
      case 'hero':
        return <Hero key={key} data={section as HeroData} />;
      case 'benefits':
        return <Benefits key={key} data={section as BenefitsData} />;
      case 'services':
        return <Services key={key} data={section as ServicesData} />;
      case 'testimonials':
        return <Testimonials key={key} data={section as TestimonialsData} />;
      case 'steps':
        return <Steps key={key} data={section as StepsData} />;
      case 'technology':
        return <Technology key={key} data={section as TechnologyData} />;
      case 'about':
        return <About key={key} data={section as AboutData} />;
      case 'faq':
        return <FAQ key={key} data={section as FAQData} />;
      case 'ctaFinal':
      case 'cta':
        return <CTAFinal key={key} data={section as CTAFinalData} />;
      case 'footer':
        return <Footer key={key} data={section as FooterData} />;
      case 'gallery':
        return <Gallery key={key} data={section} />;
      case 'pricing':
        return <Pricing key={key} data={section} />;
      case 'contact':
        return <Contact key={key} data={section} />;
      default:
        console.warn(`Unknown section type: ${(section as any).type}`);
        return null;
    }
  };

  // Extrair nome do cliente se não fornecido
  const extractedClientName = clientName ||
    (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'unknown');

  return (
    <div className="min-h-screen">
      {/* Sistema de Tracking Dinâmico */}
      <TrackingManager clientName={extractedClientName} lpData={data} />

      {/* Seções da Landing Page */}
      {data.sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default LandingPage;
