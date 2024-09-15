import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { Query } from 'blinkdb';

import { useTodoStore, type Todo } from '../stores/todoStore';
import type { FilterType } from '../stores/todoFilterStore';

export class TodoFilterer {
  private readonly filterRef: Ref<Array<TodoFilter<any>>> = ref([]);

  public setFilters(filters: Array<TodoFilter<any>>): void {
    this.filterRef.value = filters;
  }

  public resetFilters(): void {
    this.filterRef.value = [];
  }

  private readonly computedQuery: ComputedRef<Query<Todo, 'id'>> = computed(
    () => {
      const query = {};

      for (const filter of this.filterRef.value) {
        filter.adaptQuery(query);
      }

      return query;
    }
  );

  private readonly todos = useTodoStore().getRefForComputedQuery(
    this.computedQuery
  );

  public readonly filteredTodos = computed(() => {
    let ts = this.todos.value;

    for (const filter of this.filterRef.value) {
      ts = filter.filterResults(ts);
    }

    return ts;
  });
}

export interface TodoFilter<T> {
  get type(): FilterType;

  get value(): T;
  setValue(value: T): void;

  adaptQuery(query: Query<Todo, 'id'>): void;
  filterResults(todos: Array<Todo>): Array<Todo>;
}
