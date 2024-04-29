<template>
  <div
    class="flex min-w-0 grow rounded-md border border-surface-300 p-2 transition-colors duration-200 focus-within:outline-none focus-within:outline-offset-0 focus-within:ring focus-within:ring-primary-500/50 hover:border-primary-500 dark:border-surface-600 dark:focus-within:ring-primary-400/50 dark:hover:border-primary-400"
  >
    <div
      v-for="(filter, index) of selectedFilters"
      :key="index"
      class="mr-2 flex shrink-0 items-center"
    >
      <LabelItem
        v-if="filter.type === FilterType.LABEL"
        :label-id="filter.value"
      ></LabelItem>

      <div
        v-else-if="filter.type !== FilterType.TEXT"
        class="border-1 flex rounded-md border"
      >
        <div class="border-r bg-slate-100 p-1">{{ $t(filter.labelTk) }}</div>
        <div class="p-1">{{ filter.valueLabel ?? filter.value }}</div>
      </div>

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
    :pt="{
      content: {
        class: '!p-0'
      }
    }"
    :pt-options="{ mergeProps: true }"
  >
    <Listbox
      :options="suggestedFilters"
      :empty-message="$t('components.FilterBar.noAvailableFilters')"
      @change="handleItemSelected"
    >
      <template #option="{ option }">
        <LabelItem
          v-if="option.type === FilterType.LABEL"
          :label-id="option.value"
        ></LabelItem>

        <div
          v-else-if="option.type !== FilterType.TEXT"
          class="border-1 flex rounded-md border"
        >
          <div class="border-r bg-slate-100 p-1">{{ $t(option.labelTk) }}</div>
          <div class="p-1">{{ option.valueLabel ?? option.value }}</div>
        </div>
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

  import LabelItem from './labels/LabelItem.vue';

  import { useLabelStore } from '../stores/labelStore';

  import { FilterType, type Filter } from '../classes/TodoFilterer';

  const labelStore = useLabelStore();
  const labels = labelStore.getRef({});

  const suggestionsOverlayPanel = ref<OverlayPanel>();

  const props = defineProps({
    text: {
      type: String,
      default: ''
    },
    filters: {
      type: Array as PropType<Array<Filter>>,
      required: true
    }
  });

  watch(
    () => props.filters,
    () => {
      selectedFilters.value = props.filters;
    }
  );

  watch(
    () => props.text,
    () => {
      inputValue.value = props.text;
    }
  );

  const selectedFilters = ref<Array<Filter>>([]);

  const inputValue = ref('');
  const inputValueDebounced = refDebounced(inputValue);

  const emit = defineEmits<{
    (evnet: 'textChanged', text: string): void;
    (event: 'filterChanged', filter: Array<Filter>): void;
  }>();

  const suggestedFilters: ComputedRef<Array<Filter>> = computed(() => {
    return [
      ...labels.value
        .filter(
          (l) =>
            l.name
              .toLowerCase()
              .includes(inputValueDebounced.value.toLowerCase()) &&
            !selectedFilters.value.find(
              (f) => f.type === FilterType.LABEL && f.value === l.id
            )
        )
        .map((l) => ({
          ...availableFilters.label,
          value: l.id,
          valueLabel: l.name
        }))
    ];
  });

  const availableFilters: Record<FilterType, Filter> = {
    label: {
      type: FilterType.LABEL,
      labelTk: 'components.FilterBar.labelFilter',
      value: ''
    },
    text: {
      type: FilterType.TEXT,
      labelTk: 'components.FilterBar.textFilter',
      value: ''
    }
  };

  function handleItemSelected(event: ListboxChangeEvent): void {
    selectedFilters.value.push(event.value);

    emit('filterChanged', selectedFilters.value);

    inputValue.value = '';
    suggestionsOverlayPanel.value?.hide();
  }

  function handleItemRemoved(index: number): void {
    selectedFilters.value.splice(index, 1);
    emitFilterChanged();
  }

  watch(inputValueDebounced, () => {
    emit('textChanged', inputValueDebounced.value);
  });

  function emitFilterChanged(): void {
    emit('filterChanged', selectedFilters.value);
  }
</script>
