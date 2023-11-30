<template>
  <span
    class="inline-flex h-5 items-center justify-center rounded-full border pl-0.5 pr-2"
    :class="{
      '!bg-transparent': !label.color
    }"
    :style="{
      'background-color': label.color,
      'border-color': label.color || 'black',
    }"
  >
    <CustomIcon
      v-if="label.icon"
      :name="label.icon"
      class="h-full w-full py-0.5"
    />
    <Tag
      v-else
      class="h-full w-full py-0.5"
    />
    <span class="ml-1">
      {{ label.name }}
    </span>
  </span>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import { Tag } from 'lucide-vue-next';

  import CustomIcon from '../CustomIcon.vue';

  import type { Label } from '../../stores/labelStore';

  defineProps({
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  });
</script>
