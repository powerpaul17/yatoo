<template>
  <div class="drawer h-full lg:drawer-open">
    <input
      id="navigation-drawer"
      type="checkbox"
      class="drawer-toggle"
    >
    <div class="drawer-content flex flex-col overflow-y-scroll">
      <TopNavigation :scrolled="!!scrollTop" />

      <div
        class="flex h-full overflow-x-hidden"
        v-scroll="onScroll"
      >
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

  import { ref } from 'vue';
  import type { useScroll } from '@vueuse/core';
  import { vScroll } from '@vueuse/components';

  import NavigationBar from './components/NavigationBar.vue';
  import TopNavigation from './components/TopNavigation.vue';

  const scrollTop = ref(0);

  function onScroll({ y }: ReturnType<typeof useScroll>): void {
    scrollTop.value = y.value;
  }

</script>
