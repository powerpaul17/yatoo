<template>
  <ListTransition class="flex flex-col items-center">
    <TodoItem
      v-for="todo of todos"
      :key="todo.id"
      :todo="todo"
      class="mb-2 w-full max-w-5xl"
      @open="handleTodoOpenClicked"
    />
  </ListTransition>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import type { Todo } from '../stores/todoStore';

  import ListTransition from '../components/ListTransition.vue';
  import TodoItem from '../components/TodoItem.vue';

  const router = useRouter();
  const route = useRoute();

  defineProps({
    todos: {
      type: Array as PropType<Array<Todo>>,
      required: true
    }
  });

  async function handleTodoOpenClicked(todoId?: string): Promise<void> {
    await router.push({
      query: {
        ...route.query,
        todoId
      }
    });
  }
</script>
