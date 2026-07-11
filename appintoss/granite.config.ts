import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'unmyeong-lab',
  brand: {
    displayName: '운명연구소',
    primaryColor: '#c9a86a',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host 0.0.0.0',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
