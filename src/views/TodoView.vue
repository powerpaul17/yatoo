<template>
  <div class="my-2">
    <FilterBar
      :text="filterText"
      :filters="selectedFilters"
      @text-changed="handleTextChanged"
      @filter-changed="handleFilterChanged"
    ></FilterBar>

    <TodoList :todos="sortedTodos" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter, type LocationQueryValue } from 'vue-router';

  import { TodoSorter } from '../classes/TodoSorter';

  import { useLabelStore } from '../stores/labelStore';
  import {
    FilterType,
    useTodoFilterStore,
    type Filter
  } from '../stores/todoFilterStore';

  import { TodoFilterer, type TodoFilter } from '../classes/TodoFilterer';
  import { LabelFilter } from '../classes/todoFilters/LabelFilter';
  import { TextFilter } from '../classes/todoFilters/TextFilter';

  import FilterBar from '../components/FilterBar.vue';
  import TodoList from '../components/TodoList.vue';

  const todoFilterer = new TodoFilterer();

  const todoSorter = new TodoSorter();

  const router = useRouter();
  const route = useRoute();

  const labelStore = useLabelStore();

  const filterText = ref('');
  const selectedFilters = ref<Array<Filter>>([]);

  watch(
    () => route.query,
    () => {
      void updateFiltersFromRoute();
    }
  );

  onMounted(() => {
    void updateFiltersFromRoute();
  });

  async function updateRouteQuery(): Promise<void> {
    const queryParams: Record<
      string,
      LocationQueryValue | Array<LocationQueryValue>
    > = {};

    for (const [key, value] of Object.entries(route.query)) {
      if (key.startsWith('filter_')) continue;
      queryParams[key] = value;
    }

    for (const filter of selectedFilters.value) {
      const key = `filter_${filter.type}`;

      if (queryParams[key]) {
        queryParams[key] = [queryParams[key], filter.value];
      } else {
        queryParams[key] = filter.value;
      }
    }

    if (filterText.value !== '') {
      queryParams['filter_text'] = filterText.value;
    }

    await router.push({
      query: queryParams
    });
  }

  function updateTodoFiltererFilters(): void {
    const filters: Array<TodoFilter> = selectedFilters.value.map((filter) => {
      switch (filter.type) {
        case FilterType.LABEL:
          return new LabelFilter(filter.value);

        default:
          throw new Error('unknown filter type');
      }
    });

    if (filterText.value !== '') {
      filters.push(new TextFilter(filterText.value));
    }

    todoFilterer.setFilters(filters);
  }

  async function updateFiltersFromRoute(): Promise<void> {
    selectedFilters.value = [];

    const labelIdQueryParam = route.query.filter_label;

    const labelFilters = [];

    if (Array.isArray(labelIdQueryParam)) {
      labelFilters.push(...labelIdQueryParam);
    } else if (labelIdQueryParam) {
      labelFilters.push(labelIdQueryParam);
    }

    for (const labelFilterId of labelFilters) {
      if (!labelFilterId) continue;

      const label = await labelStore.getById(labelFilterId);
      if (!label) throw new Error('label not found!');

      selectedFilters.value.push({
        type: FilterType.LABEL,
        value: label.id
      });
    }

    const text = route.query.filter_text;

    if (text && !Array.isArray(text)) {
      filterText.value = text;
    }

    updateTodoFiltererFilters();
  }

  async function handleTextChanged(text: string): Promise<void> {
    filterText.value = text;
    updateTodoFiltererFilters();
    await updateRouteQuery();
  }

  async function handleFilterChanged(filters: Array<Filter>): Promise<void> {
    selectedFilters.value = filters;
    updateTodoFiltererFilters();
    await updateRouteQuery();
  }

  const sortedTodos = computed(() => {
    return todoSorter.sortTodos(todoFilterer.filteredTodos.value);
  });
</script>
