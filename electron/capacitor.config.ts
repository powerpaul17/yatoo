import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paultirk.yatoo',
  appName: 'yatoo',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
