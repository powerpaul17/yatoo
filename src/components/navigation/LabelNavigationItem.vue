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
  import { ref, type PropType } from 'vue';

  import type { Label } from '../../stores/labelStore';

  import { Tag } from 'lucide-vue-next';

  import NavigationItem from './NavigationItem.vue';
  import CustomIcon from '../CustomIcon.vue';

  const props = defineProps({
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  });
</script>
