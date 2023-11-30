<template>
  <div>
    <TodoList :todos="sortedTodos" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { TodoSorter } from '../classes/TodoSorter';

  import { useTodoStore } from '../stores/todoStore';
  import { useTodoService } from '../services/todoService';

  import TodoList from '../components/TodoList.vue';

  const todoStore = useTodoStore();
  const todoService = useTodoService();

  const todoSorter = new TodoSorter();

  const props = defineProps({
    labelId: {
      type: String,
      default: null
    }
  });

  const todosOfLabelId = todoService.getTodoRefForLabelId(
    computed(() => props.labelId)
  );

  const allTodos = todoStore.getRef({});

  const todos = computed(() => {
    return props.labelId ? todosOfLabelId.value : allTodos.value;
  });

  const sortedTodos = computed(() => {
    return todoSorter.sortTodos(todos.value);
  });
</script>
