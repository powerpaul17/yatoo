import { createRouter, createWebHashHistory } from 'vue-router';

import TodoView from './views/TodoView.vue';

import TodoSidebar from './components/todos/TodoSidebar.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/todos',
      name: 'todos',
      components: {
        default: TodoView,
        sidebar: TodoSidebar
      },
      meta: {
        titleTk: 'routes.todos'
      },
      props: {
        sidebar: (route) => ({
          todoId: route.query.todoId
        })
      }
    }
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
