import { type Ref, effectScope, ref, computed, type ComputedRef } from 'vue';

import { useSingleInstance } from '../classes/useSingleInstance';
import { useLabelToTodoStore } from '../stores/labelToTodoStore';
import { useLabelStore, type Label } from '../stores/labelStore';

const createLabelService = (): LabelService => new LabelService();

export const useLabelService = (): LabelService =>
  useSingleInstance(createLabelService);

class LabelService {
  private labelToTodoStore = useLabelToTodoStore();
  private labelStore = useLabelStore();

  public getLabelRefForTodoId(todoId: Ref<string>): ComputedRef<Array<Label>> {
    const returnValue = effectScope().run(() => {
      const labels = ref<Array<Label>>([]);

      const labelToTodos =
        this.labelToTodoStore.getRefForComputedTodoId(todoId);

      this.labelStore.watchForComputedQuery(
        computed(() => ({
          where: {
            id: {
              in: labelToTodos.value.map((l) => l.labelId)
            }
          }
        })),
        (lbls) => {
          labels.value = lbls;
        }
      );

      return computed(() => labels.value);
    });

    if (!returnValue) throw new Error('no value to return');

    return returnValue;
  }
}
