import { computed, type Ref } from 'vue';

import { useSingleInstance } from '../classes/useSingleInstance';
import { Store, type CreationEntity, type Entity } from './Store';
import { useMessageBus } from '../classes/MessageBus';
import type { EntityRemovedMessage } from './BaseStore';

const createLabelToTodoStore = (): LabelToTodoStore => new LabelToTodoStore();

export const useLabelToTodoStore = (): LabelToTodoStore =>
  useSingleInstance(createLabelToTodoStore);

class LabelToTodoStore extends Store<'label_to_todos', LabelToTodo> {
  constructor() {
    super({
      tableName: 'label_to_todos',
      migrationConfig: {
        version: 2,
        migrationFunction: (entities) =>
          entities.map((e) => ({
            id: e.id,
            createdAt: e.createdAt ?? Date.now(),
            updatedAt: e.updatedAt ?? Date.now(),
            labelId: e.labelId ?? '',
            todoId: e.todoId ?? ''
          }))
      }
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

  public countRefForLabelId(labelId: string): Ref<number> {
    return this._countRef({
      where: {
        labelId
      }
    });
  }

  public async create(labelToTodo: CreationEntity<LabelToTodo>): Promise<void> {
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
    await this.removeByIds(labelToTodos.map((l) => l.id));
  }

  private async deleteByTodoId(todoId: string): Promise<void> {
    const items = await this._getByQuery({
      where: {
        todoId
      }
    });

    await this.removeByIds(items.map((i) => i.id));
  }

  private async deleteByLabelId(labelId: string): Promise<void> {
    const items = await this._getByQuery({
      where: {
        labelId
      }
    });

    await this.removeByIds(items.map((i) => i.id));
  }
}

export type LabelToTodo = Entity & {
  labelId: string;
  todoId: string;
};
