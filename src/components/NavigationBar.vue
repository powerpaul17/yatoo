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
      <ul class="ds-menu ds-menu-lg my-1 grow p-4 text-base-content">
        <li>
          <router-link :to="{ name: 'todos' }">
            <CheckCheck />
            {{ $t('components.NavigationBar.todos') }}
          </router-link>
        </li>
      </ul>

      <div class="p-2">
        <DarkModeSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { CheckCheck } from 'lucide-vue-next';

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
