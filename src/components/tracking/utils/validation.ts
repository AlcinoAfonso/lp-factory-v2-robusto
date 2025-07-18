export function validateGoogleAdsId(id: string): boolean {
  return /^AW-\d{9,11}$/.test(id);
}

export function validateGoogleAdsConversion(id: string): boolean {
  return /^AW-\d{9,11}\/[A-Za-z0-9_-]+$/.test(id);
}

export function validateMetaPixelId(id: string): boolean {
  return /^\d{15,16}$/.test(id);
}

export function validateGA4Id(id: string): boolean {
  return /^G-[A-Z0-9]{10}$/.test(id);
}

export function validateGTMId(id: string): boolean {
  return /^GTM-[A-Z0-9]{7}$/.test(id);
}
