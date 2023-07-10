import { createApp, h, Suspense } from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import App from './App.vue';

import router from './router';

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

app.use(router);

library.add(fas, far, fab);

app.component('FontAwesomeIcon', FontAwesomeIcon);
app.component('FontAwesomeLayers', FontAwesomeLayers);
app.component('FontAwesomeLayersText', FontAwesomeLayersText);

app.mount('#app');
