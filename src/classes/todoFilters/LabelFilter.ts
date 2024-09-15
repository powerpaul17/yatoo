import { effectScope, markRaw, ref } from 'vue';
import type { And, Query } from 'blinkdb';

import type { TodoFilter } from '../TodoFilterer';
import { useLabelToTodoStore } from '../../stores/labelToTodoStore';
import type { Todo } from '../../stores/todoStore';

import { FilterType } from '../../stores/todoFilterStore';

export class LabelFilter implements TodoFilter<string> {
  private readonly data;

  constructor(labelId: string) {
    const labelIdRef = ref(labelId);

    this.data = markRaw({
      labelIdRef,
      labelToTodoRef: useLabelToTodoStore().getRefForComputedLabelId(labelIdRef)
    });
  }

  public type = FilterType.LABEL;

  public get value(): string {
    return this.data.labelIdRef.value;
  }

  public setValue(labelId: string): void {
    this.data.labelIdRef.value = labelId;
  }

  public adaptQuery(query: Query<Todo, 'id'>): void {
    return effectScope().run(() => {
      const queryAnd: And<Todo> = (query.where?.['AND'] as And<Todo>) ?? [];

      queryAnd.push({
        id: { in: this.data.labelToTodoRef.value.map((l) => l.todoId) }
      });
      const where: Query<Todo, 'id'>['where'] = {
        AND: queryAnd
      };

      query.where = {
        ...query.where,
        ...where
      };
    });
  }

  public filterResults(todos: Array<Todo>): Array<Todo> {
    return todos;
  }
}
