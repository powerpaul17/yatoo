<template>
  <NavigationItem
    :title="
      filter.name ||
      `(${$t('components.navigation.FilterNavigationItem.noFilterName')})`
    "
    :route="{
      name: 'todos',
      query: {
        ...route.query,
        filterId: filter.id,
        ...queryParams
      }
    }"
    @button-click="handleEditButtonClick()"
  >
    <template #icon>
      <FilterIcon />
    </template>

    <template #buttonIcon>
      <Pen />
    </template>
  </NavigationItem>

  <FilterEditDialog
    :filter="filter"
    :open="filterEditDialogOpen"
    @close="filterEditDialogOpen = false"
    @delete="
      filterEditDialogOpen = false;
      deleteDialogOpen = true;
    "
    @save="handleFilterSaved"
  />

  <DeleteDialog
    :open="deleteDialogOpen"
    :title="
      $t('components.navigation.FilterNavigationItem.deleteFilter', {
        filterName: filter.name
      })
    "
    @close="deleteDialogOpen = false"
    @delete="emit('delete')"
  />
</template>

<script setup lang="ts">
  import { ref, toRaw, type PropType } from 'vue';
  import { useRoute } from 'vue-router';

  import {
    useTodoFilterStore,
    type Filter,
    type TodoFilter
  } from '../../stores/todoFilterStore';

  import { FilterIcon, Pen } from 'lucide-vue-next';

  import NavigationItem from './NavigationItem.vue';
  import FilterEditDialog from '../dialogs/FilterEditDialog.vue';
  import DeleteDialog from '../dialogs/DeleteDialog.vue';
  import { computed } from 'vue';

  const route = useRoute();

  const filterStore = useTodoFilterStore();

  const props = defineProps({
    filter: {
      type: Object as PropType<TodoFilter>,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'delete'): void;
  }>();

  const filterEditDialogOpen = ref(false);

  function handleEditButtonClick(): void {
    filterEditDialogOpen.value = true;
  }

  async function handleFilterSaved({
    name,
    filters
  }: {
    name: string;
    filters: Array<Filter>;
  }): Promise<void> {
    filterEditDialogOpen.value = false;

    await filterStore.update({
      id: props.filter.id,
      name,
      filter: toRaw(filters)
    });
  }

  const deleteDialogOpen = ref(false);

  const queryParams = computed(() => {
    const params = {};

    for (const filter of props.filter.filter) {
      params[`filter_${filter.type}`] = filter.value;
    }

    return params;
  });
</script>
