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

      <div class="flex h-full overflow-hidden">
        <div
          class="w-full grow overflow-y-scroll px-3"
          v-scroll="onScroll"
        >
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

  <Toast />
  <ConfirmDialog>
    <template #message="{ message: confirmOptions }">
      <span class="whitespace-pre">{{ confirmOptions.message }}</span>
    </template>
  </ConfirmDialog>
</template>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.15s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    scale: 0.98;
  }
</style>

<script setup lang="ts">
  import { provide, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import type { useScroll } from '@vueuse/core';
  import { vScroll } from '@vueuse/components';

  import Toast from 'primevue/toast';
  import ConfirmDialog from 'primevue/confirmdialog';

  import NavigationBar from './components/NavigationBar.vue';
  import TopNavigation from './components/TopNavigation.vue';

  import { PluginManagerKey } from './provideKeys';

  import { PluginManager } from './plugins/PluginManager';

  import { ImportExportPlugin } from './plugins/ImportExportPlugin';

  const route = useRoute();

  // instantiate plugins after everything else

  const pluginManager = new PluginManager(new ImportExportPlugin());
  await pluginManager.init();

  provide(PluginManagerKey, pluginManager);

  const scrollTop = ref(0);

  function onScroll({ y }: ReturnType<typeof useScroll>): void {
    scrollTop.value = y.value;
  }

  const menuOpen = ref(false);

  watch(route, () => {
    menuOpen.value = false;
  });
</script>
