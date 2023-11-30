import { computed, type Ref } from 'vue';

import { useSingleInstance } from '../classes/useSingleInstance';
import { Store, type Entity } from './Store';
import { useMessageBus } from '../classes/MessageBus';
import type { EntityRemovedMessage } from './BaseStore';

const createLabelToTodoStore = (): LabelToTodoStore => new LabelToTodoStore();

export const useLabelToTodoStore = (): LabelToTodoStore =>
  useSingleInstance(createLabelToTodoStore);

class LabelToTodoStore extends Store<'label_to_todos', LabelToTodo> {
  constructor() {
    super({
      tableName: 'label_to_todos'
    });

    const messageBus = useMessageBus();

    messageBus.subscribe<EntityRemovedMessage<'todos'>>(
      'store::entity-removed::todos',
      async ({ id }) => {
        await this.deleteByTodoId(id);
      }
    );

    messageBus.subscribe<EntityRemovedMessage<'labels'>>(
      'store::entity-removed::labels',
      async ({ id }) => {
        await this.deleteByLabelId(id);
      }
    );
  }

  public getRefForComputedTodoId(todoId: Ref<string>): Ref<Array<LabelToTodo>> {
    return this._getRefForComputedQuery(
      computed(() => ({
        where: {
          todoId: todoId.value
        }
      }))
    );
  }

  public getRefForComputedLabelId(
    labelId: Ref<string>
  ): Ref<Array<LabelToTodo>> {
    return this._getRefForComputedQuery(
      computed(() => ({
        where: {
          labelId: labelId.value
        }
      }))
    );
  }

  public async create(labelToTodo: Omit<LabelToTodo, 'id'>): Promise<void> {
    await this._create(labelToTodo);
  }

  public async removeByLabelAndTodoId(
    labelId: string,
    todoId: string
  ): Promise<void> {
    const labelToTodos = await this._getByQuery({
      where: {
        AND: [
          {
            labelId
          },
          {
            todoId
          }
        ]
      }
    });
    await this._removeByIds(labelToTodos.map((l) => l.id));
  }

  private async deleteByTodoId(todoId: string): Promise<void> {
    const items = await this._getByQuery({
      where: {
        todoId
      }
    });

    await this._removeByIds(items.map((i) => i.id));
  }

  private async deleteByLabelId(labelId: string): Promise<void> {
    const items = await this._getByQuery({
      where: {
        labelId
      }
    });

    await this._removeByIds(items.map((i) => i.id));
  }
}

export type LabelToTodo = Entity & {
  labelId: string;
  todoId: string;
};
