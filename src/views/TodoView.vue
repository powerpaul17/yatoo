<template>
  <div class="my-2">
    <FilterBar></FilterBar>

    <TodoList :todos="sortedTodos" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { TodoSorter } from '../classes/TodoSorter';

  import FilterBar from '../components/FilterBar.vue';
  import TodoList from '../components/TodoList.vue';
  import { useFilter } from '../classes/todoFilters/useFilters';

  const { filteredTodos } = useFilter();

  const todoSorter = new TodoSorter();

  const sortedTodos = computed(() => {
    return todoSorter.sortTodos(filteredTodos.value);
  });
</script>
