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
    pt:content="!p-0"
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

<script lang="ts">
  export enum FilterType {
    LABEL = 'label',
    TEXT = 'text'
  }

  type Filter = {
    type: FilterType;
    labelTk: string;
    value: string;
    valueLabel?: string;
  };
</script>

<script setup lang="ts">
  import { computed, onMounted, ref, watch, type ComputedRef } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { refDebounced } from '@vueuse/core';

  import { X } from 'lucide-vue-next';

  import OverlayPanel from 'primevue/overlaypanel';
  import Listbox, { type ListboxChangeEvent } from 'primevue/listbox';

  import LabelItem from './labels/LabelItem.vue';

  import { useLabelStore } from '../stores/labelStore';

  import type { LocationQueryValue } from 'vue-router';

  const router = useRouter();
  const route = useRoute();

  const labelStore = useLabelStore();
  const labels = labelStore.getRef({});

  const suggestionsOverlayPanel = ref<OverlayPanel>();

  const selectedFilters = ref<Array<Filter>>([]);

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

  async function handleItemSelected(event: ListboxChangeEvent): Promise<void> {
    selectedFilters.value.push(event.value);
    await updateRouteQuery();
    inputValue.value = '';
    suggestionsOverlayPanel.value?.hide();
  }

  async function handleItemRemoved(index: number): Promise<void> {
    selectedFilters.value.splice(index, 1);

    // TODO make this more performant
    await updateRouteQuery();
    await updateTextFilterQuery();
  }

  async function updateRouteQuery(): Promise<void> {
    const queryParams: Record<
      string,
      LocationQueryValue | Array<LocationQueryValue>
    > = {};

    for (const [key, value] of Object.entries(route.query)) {
      if (key.startsWith('filter_')) continue;
      queryParams[key] = value;
    }

    for (const filter of selectedFilters.value) {
      const key = `filter_${filter.type}`;

      if (queryParams[key]) {
        queryParams[key] = [queryParams[key], filter.value];
      } else {
        queryParams[key] = filter.value;
      }
    }

    await router.push({
      query: queryParams
    });
  }

  watch(inputValueDebounced, async () => {
    await updateTextFilterQuery();
  });

  async function updateTextFilterQuery(): Promise<void> {
    await router.push({
      query: {
        ...route.query,
        filter_text:
          inputValueDebounced.value !== ''
            ? inputValueDebounced.value
            : undefined
      }
    });
  }

  watch(
    () => route.query,
    () => {
      void updateFiltersFromRoute();
    }
  );

  onMounted(() => {
    void updateFiltersFromRoute();
  });

  async function updateFiltersFromRoute(): Promise<void> {
    selectedFilters.value = [];

    const labelIdQueryParam = route.query.filter_label;

    const labelFilters = [];

    if (Array.isArray(labelIdQueryParam)) {
      labelFilters.push(...labelIdQueryParam);
    } else if (labelIdQueryParam) {
      labelFilters.push(labelIdQueryParam);
    }

    for (const labelFilterId of labelFilters) {
      if (!labelFilterId) continue;

      const label = await labelStore.getById(labelFilterId);
      if (!label) throw new Error('label not found!');

      selectedFilters.value.push({
        ...availableFilters.label,
        value: label.id,
        valueLabel: label.name
      });
    }

    const text = route.query.filter_text;

    if (text && !Array.isArray(text)) {
      inputValueDebounced.value = text;
    }
  }
</script>
