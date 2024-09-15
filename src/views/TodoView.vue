<template>
  <div class="my-2">
    <FilterBar
      :filters="filters"
      @text-filter-changed="handleTextFilterChanged"
      @filter-added="handleFilterAdded"
      @filter-removed="handleFilterRemoved"
    ></FilterBar>

    <TodoList :todos="sortedTodos" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter, useRoute, type LocationQueryValue } from 'vue-router';

  import { TodoSorter } from '../classes/TodoSorter';

  import FilterBar from '../components/FilterBar.vue';
  import TodoList from '../components/TodoList.vue';
  import { useFilter } from '../classes/todoFilters/useFilters';

  const router = useRouter();
  const route = useRoute();

  const { filteredTodos, filters } = useFilter();

  const todoSorter = new TodoSorter();

  const sortedTodos = computed(() => {
    return todoSorter.sortTodos(filteredTodos.value);
  });

  async function handleTextFilterChanged(
    textFilterValue: string
  ): Promise<void> {
    await router.push({
      query: {
        ...route.query,
        filter_text: textFilterValue !== '' ? textFilterValue : undefined
      }
    });
  }

  async function handleFilterAdded(filter: Filter): Promise<void> {
    filters.value.push(filter);
    await updateRouteQuery();
  }

  async function handleFilterRemoved(index: number): Promise<void> {
    filters.value.splice(index, 1);

    // TODO make this more performant
    await updateRouteQuery();
  }

  async function updateRouteQuery(): Promise<void> {
    const queryParams: Record<
      string,
      LocationQueryValue | Array<LocationQueryValue>
    > = {};

    for (const [key, value] of Object.entries(route.query)) {
      if (key.startsWith('filter_')) continue;
      queryParams[key] = value;
    }

    for (const filter of filters.value) {
      const key = `filter_${filter.type}`;

      if (queryParams[key]) {
        queryParams[key] = [queryParams[key], filter.value];
      } else {
        queryParams[key] = filter.value;
      }
    }

    await router.push({
      query: queryParams
    });
  }
</script>
