<template>
  <div
    class="
        absolute top-0
        h-full w-full
        cursor-pointer
        bg-black/40
        transition-colors
        duration-200
        lg:hidden
      "
    :class="{
      'pointer-events-none bg-transparent': !open
    }"
    @click="emit('close')"
  />

  <div
    class="
      relative
      h-full w-80
      shrink-0
      shadow-md
      transition-all
      duration-300
      lg:ml-0
    "
    :class="{
      '-ml-80': !open
    }"
  >
    <div class="flex h-full flex-col overflow-y-scroll bg-base-200">
      <ul class="grow p-2">
        <NavigationItem
          :title="t('components.NavigationBar.todos')"
          :route="{ name: 'todos' }"
        >
          <template #icon>
            <CheckCheck />
          </template>
        </NavigationItem>
      </ul>

      <div class="p-2">
        <DarkModeSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { CheckCheck } from 'lucide-vue-next';

  import NavigationItem from './navigation/NavigationItem.vue';
  import DarkModeSwitcher from './DarkModeSwitcher.vue';

  defineProps({
    open: {
      type: Boolean,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void
  }>();

</script>
