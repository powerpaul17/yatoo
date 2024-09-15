import {
  computed,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref
} from 'vue';
import { useRoute } from 'vue-router';

import { TodoFilterer, type TodoFilter } from '../TodoFilterer';
import { LabelFilter } from './LabelFilter';
import { TextFilter } from './TextFilter';
import type { Todo } from '../../stores/todoStore';
import { useSingleInstance } from '../useSingleInstance';
import { type Filter } from '../../stores/todoFilterStore';

const createTodoFilterer = (): TodoFilterer => new TodoFilterer();

export function useFilter(): {
  filteredTodos: Ref<Array<Todo>>;
  filters: ComputedRef<Array<Filter>>;
} {
  const currentFilters: Ref<Array<TodoFilter<any>>> = ref([]);

  const todoFilterer = useSingleInstance(createTodoFilterer);

  onMounted(() => {
    updateFiltersFromRoute();
  });

  const route = useRoute();

  watch(
    () => route.query,
    () => {
      updateFiltersFromRoute();
    }
  );

  function updateFiltersFromRoute(): void {
    const filters: Array<TodoFilter<any>> = [];

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

    currentFilters.value = filters;
  }

  watch(currentFilters, () => {
    todoFilterer.setFilters(currentFilters.value);
  });

  return {
    filteredTodos: todoFilterer.filteredTodos,
    filters: computed(() =>
      currentFilters.value.map((f) => ({ type: f.type, value: f.value }))
    )
  };
}
