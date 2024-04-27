<template>
  <div
    class="relative flex w-full items-center p-2 transition-shadow"
    :class="{ 'shadow-md': scrolled }"
  >
    <div class="flex-none lg:hidden">
      <IconButton @click="emit('toggle-menu')">
        <template #icon>
          <Menu />
        </template>
      </IconButton>
    </div>

    <div class="mx-2 flex min-w-0 flex-1 items-center px-2">
      <span class="mr-4 shrink-0 overflow-hidden text-ellipsis">
        {{ $t(route.meta.titleTk ?? '') }}
      </span>

      <router-view
        name="topNavigation"
        v-slot="{ Component, route: r }"
      >
        <Suspense>
          <component
            :is="Component"
            v-bind="r.params"
          ></component>
        </Suspense>
      </router-view>
    </div>

    <div class="flex-none">
      <IconButton @click="createInputOverlayOpen = true">
        <template #icon>
          <Plus />
        </template>
      </IconButton>
    </div>
  </div>

  <CreateInputOverlay
    :open="createInputOverlayOpen"
    @close="createInputOverlayOpen = false"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';

  import { Menu, Plus } from 'lucide-vue-next';

  import IconButton from './IconButton.vue';
  import CreateInputOverlay from './CreateInputOverlay.vue';

  const route = useRoute();

  defineProps({
    scrolled: {
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits<{
    (event: 'toggle-menu'): void;
  }>();

  const createInputOverlayOpen = ref(false);
</script>
