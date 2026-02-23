import { effectScope, h, markRaw, ref, type Component } from 'vue';

import { type Selector } from '@signaldb/core';

import type { TodoFilter } from '../TodoFilterer';
import { useLabelToTodoStore } from '../../stores/labelToTodoStore';
import type { Todo } from '../../stores/todoStore';

import LabelItem from '../../components/labels/LabelItem.vue';

export class LabelFilter implements TodoFilter<string> {
  private readonly data;

  constructor(labelId: string) {
    const labelIdRef = ref(labelId);

    this.data = markRaw({
      labelIdRef,
      labelToTodoRef: useLabelToTodoStore().getRefForComputedLabelId(labelIdRef)
    });
  }

  public type = 'label';

  public get value(): string {
    return this.data.labelIdRef.value;
  }

  public setValue(labelId: string): void {
    this.data.labelIdRef.value = labelId;
  }

  public adaptQuery(query: Selector<Todo>): void {
    const queryAnd: Selector<Todo>['$and'] = query.$and ?? [];

    queryAnd.push({
      id: { $in: this.data.labelToTodoRef.value.map((l) => l.todoId) }
    });

    query.$and = queryAnd;
  }

  public filterResults(todos: Array<Todo>): Array<Todo> {
    return todos;
  }

  public getFilterBarComponent(): Component {
    return h(LabelItem, { labelId: this.data.labelIdRef.value });
  }
}
