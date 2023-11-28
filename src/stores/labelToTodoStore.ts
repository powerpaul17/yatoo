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
