<template>
  <div class="drawer-side">
    <label
      for="navigation-drawer"
      class="drawer-overlay"
    />

    <div class="flex h-full w-80 flex-col overflow-y-scroll bg-base-200">
      <ul class="menu menu-lg my-1 grow p-4 text-base-content">
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

</script>
