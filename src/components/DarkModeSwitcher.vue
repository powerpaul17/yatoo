<template>
  <Button
    text
    icon
    rounded
    plain
    @click="darkmode = !darkmode"
  >
    <template #icon="{ value, class: cls }">
      <Sun
        v-if="!darkmode"
        :class="cls"
      />
      <MoonStar
        v-else
        :class="cls"
      />
    </template>
  </Button>
</template>

<script setup lang="ts">
  import { useDark } from '@vueuse/core';

  import Button from 'primevue/button';

  import { MoonStar, Sun } from 'lucide-vue-next';

  const darkmode = useDark({
    attribute: 'data-theme',
    storageKey: 'yatoo-color-scheme',
    valueDark: 'dark',
    valueLight: 'light'
  });
</script>
