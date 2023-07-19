<template>
  <div class="drawer h-full lg:drawer-open">
    <input
      id="navigation-drawer"
      type="checkbox"
      class="drawer-toggle"
    >
    <div class="drawer-content flex flex-col overflow-y-scroll">
      <TopNavigation />

      <div class="flex h-full overflow-x-hidden">
        <div class="grow px-3">
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
      </div>
    </div>

    <NavigationBar />
  </div>
</template>

<script setup lang="ts">

  import NavigationBar from './components/NavigationBar.vue';
  import TopNavigation from './components/TopNavigation.vue';

</script>
