import './main.css';

import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

import { createApp, h, Suspense } from 'vue';
import { createI18n } from 'vue-i18n';

import PrimeVue from 'primevue/config';

import { definePreset } from '@primevue/themes';
import Lara from '@primevue/themes/lara';

import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import en from '../i18n/en.json';

import App from './App.vue';

import router from './router';

import { Logger } from './classes/Logger';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        Logger.log('main', 'service worker registered:', registration);
      })
      .catch((reason) => {
        Logger.warn('main', 'service worker registration failed:', reason);
      });
  });
}

dayjs.extend(LocalizedFormat);

const app = createApp({
  render: () => {
    return h(Suspense, null, {
      default: () => h(App),
      fallback: () =>
        h('div', { class: 'w-full h-full flex justify-center' }, [
          h('div', { class: 'loading loading-spinner loading-lg' })
        ])
    });
  }
});

const yatooThemePreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}'
    }
  }
});

app.use(PrimeVue, {
  theme: {
    preset: yatooThemePreset,
    options: {
      prefix: 'p',
      darkModeSelector: '[data-theme=dark]',
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  }
});

app.use(ToastService);
app.use(ConfirmationService);

type MessageSchema = typeof en;

const i18n = createI18n<[MessageSchema]>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en
  }
});

app.use(i18n);

app.use(router);

declare const COMMIT_HASH: string;
app.provide('COMMIT_HASH', COMMIT_HASH.slice(0, 8));

declare const VERSION: string;
app.provide('VERSION', VERSION);

app.mount('#app');
