<template>
  <div>
    <TodoList :todos="todos" />
  </div>
</template>

<script setup lang="ts">

  import { useTodoStore } from '../stores/todoStore';

  import TodoList from '../components/TodoList.vue';

  const todoStore = useTodoStore();

  const todos = todoStore.getRef({});

</script>
