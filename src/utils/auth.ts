export function getAppOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin; // local, preview ή prod
  }
  return 'https://ai-kafetzou-20.lovable.app'; // fallback σε production
}
