<template>
  <div class="flex h-full w-fit lg:w-full">
    <NavigationBar
      :open="menuOpen"
      @close="menuOpen = false"
    />

    <div class="flex w-screen grow flex-col overflow-y-scroll lg:w-auto">
      <TopNavigation
        :scrolled="!!scrollTop"
        @toggle-menu="menuOpen = !menuOpen"
      />

      <div
        class="flex h-full overflow-x-hidden"
        v-scroll="onScroll"
      >
        <div class="w-full grow px-3">
          <router-view v-slot="{ Component, route }">
            <Transition
              name="fade"
              mode="out-in"
            >
              <Suspense>
                <component
                  :is="Component"
                  :key="route.path"
                  v-bind="route.params"
                />
              </Suspense>
            </Transition>
          </router-view>
        </div>

        <router-view
          name="sidebar"
          v-slot="{ Component, route }"
        >
          <Suspense>
            <component
              :is="Component"
              :key="route.path"
              v-bind="route.params"
            />
          </Suspense>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style>

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  scale: 0.95;
}

</style>

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

  const menuOpen = ref(false);

</script>
