<template>
  <div
    class="absolute top-0 z-10 h-full w-full cursor-pointer bg-black/40 transition-colors duration-200 lg:hidden"
    :class="{
      'pointer-events-none bg-transparent': !open
    }"
    @click="emit('close')"
  />

  <div
    class="relative z-20 h-full w-80 shrink-0 shadow-md transition-all duration-300 lg:ml-0"
    :class="{
      '-ml-80': !open
    }"
  >
    <div class="flex h-full flex-col overflow-y-scroll bg-base-200">
      <ul class="grow p-2">
        <NavigationItem
          :title="$t('components.NavigationBar.todos')"
          :route="{ name: 'todos' }"
        >
          <template #icon>
            <CheckCheck />
          </template>
        </NavigationItem>

        <NavigationItem
          :title="$t('components.NavigationBar.labels')"
          @button-click="handleAddLabelClick()"
        >
          <template #icon>
            <Tags />
          </template>

          <template #buttonIcon>
            <Plus />
          </template>

          <template #children>
            <LabelNavigationItem
              v-for="label of labels"
              :key="label.id"
              :label="label"
              @delete="handleDeleteLabel(label.id)"
            />

            <NavigationItem
              v-if="!labels.length"
              :title="$t('components.NavigationBar.noLabels')"
            />
          </template>
        </NavigationItem>
      </ul>

      <div class="p-2">
        <DarkModeSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CheckCheck, Plus, Tags } from 'lucide-vue-next';

  import NavigationItem from './navigation/NavigationItem.vue';
  import LabelNavigationItem from './navigation/LabelNavigationItem.vue';
  import DarkModeSwitcher from './DarkModeSwitcher.vue';

  import { useLabelStore } from '../stores/labelStore';

  const labelStore = useLabelStore();

  const labels = labelStore.getRef({});

  defineProps({
    open: {
      type: Boolean,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
  }>();

  async function handleAddLabelClick(): Promise<void> {
    await labelStore.create({
      name: '',
      color: '',
      icon: ''
    });
  }

  async function handleDeleteLabel(labelId: string): Promise<void> {
    await labelStore.remove(labelId);
  }
</script>
