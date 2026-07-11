export const APP_NAME = import.meta.env.VITE_APP_NAME || 'unmyeong-lab';
export const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'anonymous-toss') as 'anonymous-toss' | 'toss-login' | 'guest';
export const TOSS_LOGIN_ENABLED = import.meta.env.VITE_TOSS_LOGIN_ENABLED === 'true';
export const OG_IMAGE_URL = import.meta.env.VITE_OG_IMAGE_URL || 'https://ddragonjh.github.io/saju-lab/assets/og-image.png';

export const ROUTES = {
  home: '/',
  saju: '/saju',
  tarot: '/tarot',
  fortune: '/fortune',
  oracle: '/oracle',
  zodiac: '/zodiac',
  records: '/records',
  settings: '/settings',
};
