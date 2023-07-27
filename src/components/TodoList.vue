<template>
  <ListTransition class="flex flex-col items-center">
    <TodoItem
      v-for="todo of todos"
      :key="todo.id"
      :todo="todo"
      class="mb-1 w-full max-w-5xl"
    />
  </ListTransition>
</template>

<script setup lang="ts">

  import type { PropType } from 'vue';

  import type { Todo } from '../stores/todoStore';

  import ListTransition from '../components/ListTransition.vue';
  import TodoItem from '../components/TodoItem.vue';

  defineProps({
    todos: {
      type: Array as PropType<Array<Todo>>,
      required: true
    }
  });

</script>
