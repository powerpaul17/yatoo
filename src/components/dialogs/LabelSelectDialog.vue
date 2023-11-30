<template>
  <DialogComponent
    :title="$t('components.dialogs.LabelSelectDialog.title')"
    :open="open"
    @close="emit('close')"
  >
    <template #default>
      <AutoComplete
        class="w-full"
        v-model="selectedLabels"
        :suggestions="suggestions"
        option-label="name"
        data-key="id"
        dropdown
        multiple
        dropdown-mode="current"
        @dropdown-click="suggestions = suggestions.slice()"
        @complete="(event) => (query = event.query)"
        :pt="{
          token: {
            class: 'bg-transparent p-1'
          },
          container: {
            class: 'w-full'
          }
        }"
      >
        <template #chip="{ value: label }">
          <LabelItem :label="label" />
        </template>

        <template #option="{ option: label }">
          <LabelItem :label="label" />
        </template>
      </AutoComplete>
    </template>

    <template #actions>
      <Button
        :label="$t('components.dialogs.LabelSelectDialog.discard')"
        @click="emit('close')"
      />

      <Button
        :label="$t('components.dialogs.LabelSelectDialog.save')"
        @click="
          () => {
            labelsChanged();
            emit('close');
          }
        "
      />
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import Button from 'primevue/button';
  import AutoComplete from 'primevue/autocomplete';

  import DialogComponent from './DialogComponent.vue';
  import LabelItem from '../labels/LabelItem.vue';

  import { type Label, useLabelStore } from '../../stores/labelStore';
  import { useLabelToTodoStore } from '../../stores/labelToTodoStore';

  import { useLabelService } from '../../services/labelService';

  import { Utils } from '../../classes/Utils';

  const labelStore = useLabelStore();
  const labelToTodoStore = useLabelToTodoStore();

  const labelService = useLabelService();

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    todoId: {
      type: String,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
  }>();

  const savedLabels = labelService.getLabelRefForTodoId(
    computed(() => props.todoId)
  );

  const selectedLabels = ref<Array<Label>>([]);

  watch(savedLabels, () => {
    selectedLabels.value = savedLabels.value;
  });

  const availableLabels = labelStore.getRef({});

  const query = ref('');

  const suggestions = ref<Array<Label>>([]);

  const suggestedLabels = computed(() => {
    return availableLabels.value.filter(
      (l) =>
        !selectedLabels.value.map((l) => l.id).includes(l.id) &&
        l.name.toUpperCase().includes(query.value.toUpperCase())
    );
  });

  watch(suggestedLabels, () => {
    suggestions.value = suggestedLabels.value;
  });

  function labelsChanged(): void {
    const { onlyInArray1: labelsToDelete, onlyInArray2: labelsToAdd } =
      Utils.computeArrayElementDifferences(
        savedLabels.value,
        selectedLabels.value,
        (label1, label2) => {
          return label1.id === label2.id;
        }
      );

    labelsToDelete.forEach((l) => {
      void labelToTodoStore.removeByLabelAndTodoId(l.id, props.todoId);
    });

    labelsToAdd.forEach((l) => {
      void labelToTodoStore.create({
        todoId: props.todoId,
        labelId: l.id
      });
    });
  }
</script>
