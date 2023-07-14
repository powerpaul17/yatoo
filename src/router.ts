import { createRouter, createWebHashHistory } from 'vue-router';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
  ],
  scrollBehavior(to, _from, _savedPosition) {
    return new Promise((res) => {
      if (to.hash) {
        setTimeout(() => {
          res({
            el: to.hash,
            behavior: 'smooth'
          });
        }, 100);
      } else {
        res();
      }
    });
  }
});

declare module 'vue-router' {

  interface RouteMeta {
    titleTk: string;
  }

}
