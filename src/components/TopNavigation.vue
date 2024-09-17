<template>
  <Toolbar
    :pt:root:class="[
      'p-2 transition-shadow rounded-none',
      { 'shadow-md': scrolled }
    ]"
    pt:center:class="flex-1 min-w-0"
  >
    <template #start>
      <div class="lg:hidden">
        <IconButton @click="emit('toggle-menu')">
          <template #icon>
            <Menu />
          </template>
        </IconButton>
      </div>

      <span class="shrink-0 overflow-hidden text-ellipsis">
        {{ $t(route.meta.titleTk ?? '') }}
      </span>
    </template>

    <template #center>
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
    </template>

    <template #end>
      <IconButton @click="createInputOverlayOpen = true">
        <template #icon>
          <Plus />
        </template>
      </IconButton>
    </template>
  </Toolbar>

  <CreateInputOverlay
    :open="createInputOverlayOpen"
    @close="createInputOverlayOpen = false"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';

  import Toolbar from 'primevue/toolbar';

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
