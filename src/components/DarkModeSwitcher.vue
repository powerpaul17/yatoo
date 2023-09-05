<template>
  <label class="ds-swap ds-btn-ghost ds-swap-rotate ds-btn-circle ds-btn">
    <input
      type="checkbox"
      v-model="darkmode"
    >
    <Sun class="ds-wap-off" />
    <MoonStar class="ds-swap-on" />
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
