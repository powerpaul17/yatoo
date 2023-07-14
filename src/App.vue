<template>
  <div class="drawer h-full overflow-x-hidden lg:drawer-open">
    <input
      id="navigation-drawer"
      type="checkbox"
      class="drawer-toggle"
    >
    <div class="drawer-content flex flex-col">
      <TopNavigation />

      <Suspense>
        <router-view v-slot="{ Component, route }">
          <transition
            name="fade"
            mode="out-in"
          >
            <component
              :is="Component"
              :key="route.path"
            />
          </transition>
        </router-view>
      </Suspense>
    </div>

    <NavigationBar />
  </div>
</template>

<script setup lang="ts">

  import NavigationBar from './components/NavigationBar.vue';
  import TopNavigation from './components/TopNavigation.vue';

</script>
