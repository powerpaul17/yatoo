import { createRouter, createWebHashHistory } from 'vue-router';

import TodoView from './views/TodoView.vue';

import TodoSidebar from './components/todos/TodoSidebar.vue';
import FilterBar from './components/FilterBar.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: {
        name: 'todos'
      }
    },
    {
      path: '/todos',
      name: 'todos',
      components: {
        default: TodoView,
        sidebar: TodoSidebar,
        topNavigation: FilterBar
      },
      meta: {
        titleTk: 'routes.todos'
      },
      props: {
        sidebar: (route): Record<string, any> => ({
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
