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
  >
    <template #icon>
      <CustomIcon
        v-if="label.icon"
        :name="label.icon"
      />
      <Tag v-else />
    </template>
  </NavigationItem>
</template>

<script setup lang="ts">
  import { type PropType } from 'vue';

  import type { Label } from '../../stores/labelStore';
  import { useLabelToTodoStore } from '../../stores/labelToTodoStore';

  import { Tag } from 'lucide-vue-next';

  import NavigationItem from './NavigationItem.vue';
  import CustomIcon from '../CustomIcon.vue';

  const labelToTodoStore = useLabelToTodoStore();

  const props = defineProps({
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  });

  const numberOfTodos = labelToTodoStore.countRefForLabelId(props.label.id);
</script>
