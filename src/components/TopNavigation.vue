<template>
  <div
    class="navbar z-10 transition-shadow"
    :class="{ 'shadow-md': scrolled }"
  >
    <div class="flex-none lg:hidden">
      <button
        class="btn-ghost btn-square btn"
        @click="emit('toggle-menu')"
      >
        <Menu />
      </button>
    </div>

    <div class="mx-2 min-w-0 flex-1 px-2">
      <span class="overflow-hidden text-ellipsis">{{ $t(route.meta.titleTk ?? '') }}</span>
    </div>

    <div class="flex-none">
      <button
        class="btn-ghost btn-circle btn"
        @click="createInputOverlayOpen = true"
      >
        <Plus />
      </button>
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
