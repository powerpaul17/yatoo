<template>
  <div class="-mb-1">
    <LabelItem
      v-for="label of labels"
      class="mb-1 mr-1 last:mr-0"
      :key="label.id"
      :label="label"
    />
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import LabelItem from './LabelItem.vue';

  import type { Label } from '../../stores/labelStore';

  defineProps({
    labels: {
      type: Array as PropType<Array<Label>>,
      required: true
    }
  });
</script>
