<template>
  <span
    v-if="label"
    class="inline-flex h-5 items-center justify-center rounded-full border pl-0.5 pr-2"
    :class="{
      '!px-0.5': compact,
      '!bg-transparent': hollow || !label.color
    }"
    :style="{
      'background-color': label.color,
      'border-color': label.color || 'black',
      color: hollow ? label.color : undefined
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
    <span
      v-if="!compact"
      class="ml-1 whitespace-nowrap"
    >
      {{ label.name }}
    </span>
  </span>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  import { Tag } from 'lucide-vue-next';

  import CustomIcon from '../CustomIcon.vue';

  import { useLabelStore, type Label } from '../../stores/labelStore';

  const labelStore = useLabelStore();

  const props = defineProps({
    labelId: {
      type: String,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    },
    hollow: {
      type: Boolean,
      default: false
    }
  });

  const labelQuery = computed(() => {
    return {
      where: {
        id: props.labelId
      }
    };
  });

  const label = ref<Label | null>(null);

  labelStore.watchForComputedQuery(labelQuery, (labels) => {
    label.value = labels[0] ?? null;
  });
</script>
