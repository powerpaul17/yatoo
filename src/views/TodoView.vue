<template>
  <div>
    <TodoList :todos="sortedTodos" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { useTodoStore } from '../stores/todoStore';
  import { TodoSorter } from '../classes/TodoSorter';

  import TodoList from '../components/TodoList.vue';

  const todoStore = await useTodoStore();

  const todos = todoStore.getRef({});

  const todoSorter = new TodoSorter();

  const sortedTodos = computed(() => {
    return todoSorter.sortTodos(todos.value);
  });
</script>
