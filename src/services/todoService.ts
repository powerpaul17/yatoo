import { type Ref, effectScope, ref, computed, type ComputedRef } from 'vue';

import { useSingleInstance } from '../classes/useSingleInstance';
import { useLabelToTodoStore } from '../stores/labelToTodoStore';
import { useTodoStore, type Todo } from '../stores/todoStore';

const createTodoService = (): TodoService => new TodoService();

export const useTodoService = (): TodoService =>
  useSingleInstance(createTodoService);

class TodoService {
  private labelToTodoStore = useLabelToTodoStore();
  private todoStore = useTodoStore();

  public getTodoRefForLabelId(labelId: Ref<string>): ComputedRef<Array<Todo>> {
    const returnValue = effectScope().run(() => {
      const todos = ref<Array<Todo>>([]);

      const labelToTodos =
        this.labelToTodoStore.getRefForComputedLabelId(labelId);

      this.todoStore.watchForComputedQuery(
        computed(() => ({
          where: {
            id: {
              in: labelToTodos.value.map((l) => l.todoId)
            }
          }
        })),
        (tds) => {
          todos.value = tds;
        }
      );

      return computed(() => todos.value);
    });

    if (!returnValue) throw new Error('no value to return');

    return returnValue;
  }
}
