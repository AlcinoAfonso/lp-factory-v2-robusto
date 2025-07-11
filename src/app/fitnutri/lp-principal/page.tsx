import LandingPage from '@/components/LandingPage'; import { LandingPageData } from '@/types/lp-config'; import lpData from './lp.json';  const config = lpData as LandingPageData;  export default function FitNutriPage() {   return <LandingPage data={config} />; }

