import { type Ref, effectScope, ref, computed } from 'vue';

import { useSingleInstance } from '../classes/useSingleInstance';
import { useLabelToTodoStore } from '../stores/labelToTodoStore';
import { useTodoStore, type Todo } from '../stores/todoStore';

const createTodoService = (): TodoService => new TodoService();

export const useTodoService = (): TodoService =>
  useSingleInstance(createTodoService);

class TodoService {
  private labelToTodoStore = useLabelToTodoStore();
  private todoStore = useTodoStore();

  public getTodoRefForLabelId(labelId: Ref<string>): Ref<Array<Todo>> {
    return effectScope().run(() => {
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

      return todos;
    });
  }
}
