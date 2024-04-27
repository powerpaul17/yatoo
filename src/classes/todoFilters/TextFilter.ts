import { markRaw, ref } from 'vue';

import type { TodoFilter } from '../TodoFilterer';
import type { Todo } from '../../stores/todoStore';

export class TextFilter implements TodoFilter {
  public readonly data;

  constructor(text: string) {
    this.data = markRaw({
      textRef: ref(text)
    });
  }

  public adaptQuery(): void {}

  public filterResults(todos: Array<Todo>): Array<Todo> {
    return todos.filter(
      (todo) =>
        todo.title
          .toLowerCase()
          .indexOf(this.data.textRef.value.toLowerCase()) >= 0 ||
        todo.description
          .toLowerCase()
          .indexOf(this.data.textRef.value.toLowerCase()) >= 0
    );
  }
}
