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
    <div
      class="flex h-full flex-col overflow-y-scroll bg-surface-300 dark:bg-surface-700"
    >
      <ul class="grow p-2">
        <NavigationItem
          :title="$t('components.NavigationBar.todos')"
          :route="{ name: 'todos' }"
          :badge-value="numberOfTodos"
        >
          <template #icon>
            <CheckCheck />
          </template>
        </NavigationItem>

        <NavigationItem
          :title="$t('components.NavigationBar.labels')"
          :open="!!labels.length"
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
              v-for="label of sortedLabels"
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
  import { computed } from 'vue';

  import { CheckCheck, Plus, Tags } from 'lucide-vue-next';

  import NavigationItem from './navigation/NavigationItem.vue';
  import LabelNavigationItem from './navigation/LabelNavigationItem.vue';
  import DarkModeSwitcher from './DarkModeSwitcher.vue';

  import { useTodoStore } from '../stores/todoStore';
  import { useLabelStore } from '../stores/labelStore';

  const todoStore = useTodoStore();
  const labelStore = useLabelStore();

  const numberOfTodos = todoStore.countRef({ where: { done: false } });

  const labels = labelStore.getRef({});

  const sortedLabels = computed(() => {
    return labels.value.slice().sort((l1, l2) => {
      return l1.name.toUpperCase().localeCompare(l2.name.toUpperCase());
    });
  });

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
    await labelStore.removeById(labelId);
  }
</script>
