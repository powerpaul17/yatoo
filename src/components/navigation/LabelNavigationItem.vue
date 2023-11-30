<template>
  <NavigationItem
    :title="
      label.name ||
      `(${$t('components.navigation.LabelNavigationItem.noLabelName')})`
    "
    :route="{
      name: 'label',
      params: {
        labelId: label.id
      }
    }"
    :badge-value="numberOfTodos"
    @button-click="handleEditButtonClick()"
  >
    <template #icon>
      <CustomIcon
        v-if="label.icon"
        :name="label.icon"
      />
      <Tag v-else />
    </template>

    <template #buttonIcon>
      <Pen />
    </template>
  </NavigationItem>

  <LabelEditDialog
    :label="label"
    :open="labelEditDialogOpen"
    @close="labelEditDialogOpen = false"
  />
</template>

<script setup lang="ts">
  import { type PropType } from 'vue';

  import type { Label } from '../../stores/labelStore';
  import { useLabelToTodoStore } from '../../stores/labelToTodoStore';

  import { Pen, Tag } from 'lucide-vue-next';

  import NavigationItem from './NavigationItem.vue';
  import CustomIcon from '../CustomIcon.vue';
  import LabelEditDialog from '../dialogs/LabelEditDialog.vue';

  const labelToTodoStore = useLabelToTodoStore();

  const props = defineProps({
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  });

  const numberOfTodos = labelToTodoStore.countRefForLabelId(props.label.id);

  const labelEditDialogOpen = ref(false);

  function handleEditButtonClick(): void {
    labelEditDialogOpen.value = true;
  }
</script>
