<template>
  <div class="navbar">
    <div class="flex-none lg:hidden">
      <label
        for="navigation-drawer"
        class="btn-ghost btn-square btn"
      >
        <Menu />
      </label>
    </div>

    <div class="mx-2 min-w-0 flex-1 px-2">
      <span class="overflow-hidden text-ellipsis">{{ $t(route.meta.titleTk) }}</span>
    </div>

    <div class="flex-none">
    </div>
  </div>
</template>

<script setup lang="ts">

  import { Menu } from 'lucide-vue-next';

</script>
