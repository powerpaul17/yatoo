import { createRouter, createWebHashHistory } from 'vue-router';

import TodoView from './views/TodoView.vue';

import TodoSidebar from './components/todos/TodoSidebar.vue';
import LabelItem from './components/labels/LabelItem.vue';

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
    },
    {
      path: '/label/:labelId',
      name: 'label',
      components: {
        default: TodoView,
        sidebar: TodoSidebar,
        topNavigation: LabelItem
      },
      meta: {
        titleTk: 'routes.label'
      },
      props: {
        sidebar: (route): Record<string, any> => ({
          todoId: route.query.todoId
        }),
        topNavigation: (route): Record<string, any> => ({
          labelId: route.params.labelId
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
