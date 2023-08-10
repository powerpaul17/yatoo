<template>
  <label class="swap btn-ghost swap-rotate btn-circle btn">
    <input
      type="checkbox"
      v-model="darkmode"
    >
    <Sun class="swap-off" />
    <MoonStar class="swap-on" />
  </label>
</template>

<script setup lang="ts">

  import { useDark } from '@vueuse/core';

  import { MoonStar, Sun } from 'lucide-vue-next';

  const darkmode = useDark({
    attribute: 'data-theme',
    storageKey: 'yatoo-color-scheme',
    valueDark: 'dark',
    valueLight: 'light'
  });

</script>
