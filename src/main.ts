import { createApp, h, Suspense } from 'vue';
import { createI18n } from 'vue-i18n';

import en from '../i18n/en.json';

import App from './App.vue';

import router from './router';

// FIXME: should be sorted out in hyperid/bundler

/* @ts-ignore */
import { v4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
v4();

const app = createApp({
  render: () => {
    return h(
      Suspense,
      null,
      {
        default: () => h(App),
        fallback: () => h('div', { class: 'w-full h-full flex justify-center' }, [
          h('div', { class: 'loading loading-spinner loading-lg' })
        ])
      }
    );
  }
});

type MessageSchema = typeof en;

const i18n = createI18n<[MessageSchema]>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    'en': en
  }
});

app.use(i18n);

app.use(router);

declare const COMMIT_HASH: string;
app.provide('COMMIT_HASH', COMMIT_HASH);

app.mount('#app');
