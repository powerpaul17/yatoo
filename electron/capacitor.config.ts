import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paultirk.yatoo',
  appName: 'Yatoo',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
