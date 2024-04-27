<template>
  <div>
    <TodoList :todos="sortedTodos" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import { TodoSorter } from '../classes/TodoSorter';

  import { TodoFilterer, type TodoFilter } from '../classes/TodoFilterer';
  import { LabelFilter } from '../classes/todoFilters/LabelFilter';
  import { TextFilter } from '../classes/todoFilters/TextFilter';

  import TodoList from '../components/TodoList.vue';

  const todoFilterer = new TodoFilterer();

  const todoSorter = new TodoSorter();

  const route = useRoute();

  watch(
    () => route.query,
    () => {
      updateFiltersFromRoute();
    }
  );

  onMounted(() => {
    updateFiltersFromRoute();
  });

  function updateFiltersFromRoute(): void {
    const filters: Array<TodoFilter> = [];

    const labelIdQueryParam = route.query.filter_label;

    if (Array.isArray(labelIdQueryParam)) {
      filters.push(...labelIdQueryParam.map((l) => new LabelFilter(l)));
    } else if (labelIdQueryParam) {
      filters.push(new LabelFilter(labelIdQueryParam));
    }

    const text = route.query.filter_text;

    if (text && !Array.isArray(text)) {
      filters.push(new TextFilter(text));
    }

    todoFilterer.setFilters(filters);
  }

  const sortedTodos = computed(() => {
    return todoSorter.sortTodos(todoFilterer.filteredTodos.value);
  });
</script>
