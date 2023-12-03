import type { Todo } from '../stores/todoStore';

export class TodoSorter {
  private readonly boundCompareFunction = this.compareFunction.bind(this);

  private functions: Array<CompareFunction> = [
    (a, b): number => {
      const aVal = a.done ? 1 : 0;
      const bVal = b.done ? 1 : 0;
      return aVal - bVal;
    },
    (a, b): number => {
      const aVal = a.doneAt ?? Number.MAX_SAFE_INTEGER;
      const bVal = b.doneAt ?? Number.MAX_SAFE_INTEGER;
      return bVal - aVal;
    },
    (a, b): number => {
      return a.title.localeCompare(b.title);
    }
  ];

  public sortTodos(todos: Array<Todo>): Array<Todo> {
    return todos.slice().sort(this.boundCompareFunction);
  }

  private compareFunction(todoA: Todo, todoB: Todo): number {
    for (const func of this.functions) {
      const compareValue = func(todoA, todoB);
      if (compareValue !== 0) return compareValue;
    }

    return 0;
  }
}

type CompareFunction = (a: Todo, b: Todo) => number;
