<template>
  <div class="drawer h-full overflow-x-hidden lg:drawer-open">
    <input
      id="navigation-drawer"
      type="checkbox"
      class="drawer-toggle"
    >
    <div class="drawer-content flex flex-col">
      <Suspense>
        <router-view />
      </Suspense>
    </div>

    <NavigationBar />
  </div>
</template>

<script setup lang="ts">

  import NavigationBar from './components/NavigationBar.vue';

</script>
