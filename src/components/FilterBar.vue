<template>
  <div
    class="flex min-w-0 grow rounded-md border border-surface-300 p-2 transition-colors duration-200 focus-within:outline-none focus-within:outline-offset-0 focus-within:ring focus-within:ring-primary-500/50 hover:border-primary-500 dark:border-surface-600 dark:focus-within:ring-primary-400/50 dark:hover:border-primary-400"
  >
    <div
      v-for="(filter, index) of filters"
      :key="index"
      class="mr-2 flex shrink-0 items-center"
    >
      <component :is="getFilterBarComponent(filter)" />

      <!-- <span v-else>{{ filter.value }}</span> -->

      <X
        v-if="filter.type !== FilterType.TEXT"
        class="ml-1 shrink-0 cursor-pointer"
        @click="handleItemRemoved(index)"
        :size="18"
      ></X>
    </div>

    <input
      class="min-w-0 grow outline-none"
      v-model.trim="inputValue"
      :placeholder="$t('components.FilterBar.placeholder')"
      @focus="suggestionsOverlayPanel?.show"
    />
  </div>

  <OverlayPanel
    ref="suggestionsOverlayPanel"
    pt:content="!p-0"
    :pt-options="{ mergeProps: true }"
  >
    <Listbox
      :options="suggestedFilters"
      :empty-message="$t('components.FilterBar.noAvailableFilters')"
      @change="handleItemSelected"
    >
      <template #option="{ option }">
        <component :is="getFilterBarComponent(option)" />
      </template>
    </Listbox>
  </OverlayPanel>
</template>

<script setup lang="ts">
  import { computed, ref, watch, type ComputedRef, type PropType } from 'vue';
  import { refDebounced } from '@vueuse/core';

  import { X } from 'lucide-vue-next';

  import OverlayPanel from 'primevue/overlaypanel';
  import Listbox, { type ListboxChangeEvent } from 'primevue/listbox';

  import { useLabelStore } from '../stores/labelStore';

  import {
    FilterType,
    getFilterBarComponent,
    type Filter
  } from '../stores/todoFilterStore';

  const props = defineProps({
    filters: {
      type: Array as PropType<Array<Filter>>,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'current-todo-filter-deselected'): void;
    (event: 'text-filter-changed', textFilterValue: string): void;
    (event: 'filter-added', filter: Filter): void;
    (event: 'filter-removed', index: number): void;
  }>();

  const labelStore = useLabelStore();
  const labels = labelStore.getRef({});

  const suggestionsOverlayPanel = ref<OverlayPanel>();

  const inputValue = ref('');
  const inputValueDebounced = refDebounced(inputValue);

  const suggestedFilters: ComputedRef<Array<Filter>> = computed(() => {
    return [
      ...labels.value
        .filter(
          (l) =>
            l.name
              .toLowerCase()
              .includes(inputValueDebounced.value.toLowerCase()) &&
            !props.filters.find(
              (f) => f.type === FilterType.LABEL && f.value === l.id
            )
        )
        .map((l) => ({ type: FilterType.LABEL, value: l.id }))
    ];
  });

  watch(
    () => props.filters,
    () => {
      const textFilter = props.filters.find((f) => f.type === FilterType.TEXT);
      if (textFilter) inputValue.value = textFilter.value;
    }
  );

  function handleItemSelected(event: ListboxChangeEvent): void {
    emit('filter-added', event.value);

    inputValue.value = '';
    suggestionsOverlayPanel.value?.hide();
  }

  function handleItemRemoved(index: number): void {
    emit('filter-removed', index);
  }

  watch(inputValueDebounced, () => {
    updateTextFilterQuery();
  });

  function updateTextFilterQuery(): void {
    emit('text-filter-changed', inputValueDebounced.value);
  }
</script>
