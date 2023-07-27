<template>
  <div
    class="
      rounded-md
      bg-neutral text-neutral-content hover:bg-neutral-focus
      focus:bg-neutral-focus
    "
  >
    <div class="flex items-center p-1">
      <div>
      </div>
      <div class="flex-auto">
        {{ todo.title }}
      </div>
      <div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { type PropType } from 'vue';

  import type { Todo } from '../stores/todoStore';

  defineProps({
    todo: {
      type: Object as PropType<Todo>,
      required: true
    }
  });

</script>
