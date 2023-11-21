import { createApp, h, Suspense } from 'vue';
import { createI18n } from 'vue-i18n';

import en from '../i18n/en.json';

import App from './App.vue';

import router from './router';

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

app.provide('COMMIT_HASH', process.env.COMMIT_HASH);

app.mount('#app');
