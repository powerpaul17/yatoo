<template>
  <span
    v-if="label"
    class="inline-flex h-5 items-center justify-center rounded-full border pl-0.5 pr-2"
    :class="{
      '!px-0.5': compact,
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
    <span
      v-if="!compact"
      class="ml-1"
    >
      {{ label.name }}
    </span>
  </span>
</template>

<script setup lang="ts">
  import { watch, ref, onMounted } from 'vue';

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
    }
  });

  const label = ref<Label | null>(null);

  watch(
    () => props.labelId,
    async () => {
      await updateLabel();
    }
  );

  onMounted(async () => {
    await updateLabel();
  });

  async function updateLabel(): Promise<void> {
    label.value = await labelStore.getById(props.labelId);
  }
</script>
