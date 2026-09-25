export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function reducedMotionRequested(hash: string): boolean {
  const value = new URLSearchParams(hash.replace(/^#\??/, '')).get('reducedMotion');
  return value === 'true' || value === '1';
}
