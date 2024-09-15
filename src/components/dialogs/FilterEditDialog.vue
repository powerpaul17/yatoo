<template>
  <DialogComponent
    :title="$t('components.dialogs.FilterEditDialog.title')"
    :open="open"
    @close="emit('close')"
  >
    <template #default>
      <div class="my-4 flex flex-col">
        <label>
          {{ $t('entities.filter.name') }}
        </label>
        <InputText v-model="name" />
      </div>

      <div class="my-4 flex flex-col">
        <label>
          {{ $t('entities.filter.filter') }}
        </label>

        <FilterBar
          :filters="filters"
          @filter-added="handleFilterAdded"
          @filter-removed="handleFilterRemoved"
        ></FilterBar>
      </div>
    </template>

    <template #actions>
      <Button
        severity="warn"
        :label="$t('components.dialogs.FilterEditDialog.delete')"
        @click="emit('delete')"
      >
        <template #icon="{ class: cls }">
          <Trash :class="cls" />
        </template>
      </Button>

      <Button
        :label="$t('components.dialogs.FilterEditDialog.save')"
        @click="
          emit('save', {
            name,
            filters
          })
        "
      >
        <template #icon="{ class: cls }">
          <Save :class="cls" />
        </template>
      </Button>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch, type PropType } from 'vue';

  import { Save, Trash } from 'lucide-vue-next';

  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';

  import DialogComponent from './DialogComponent.vue';
  import FilterBar from '../FilterBar.vue';

  import { type Filter, type TodoFilter } from '../../stores/todoFilterStore';

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object as PropType<TodoFilter>,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'delete'): void;
    (
      event: 'save',
      filterProperties: {
        name: string;
        filters: Array<Filter>;
      }
    ): void;
  }>();

  const name = ref(props.filter.name);

  const filters = ref<Array<Filter>>([]);

  watch(
    () => props.filter,
    () => {
      updateValuesFromProps();
    }
  );

  onMounted(() => {
    updateValuesFromProps();
  });

  function updateValuesFromProps(): void {
    filters.value = props.filter.filter;
  }

  function handleFilterAdded(filter: Filter): void {
    filters.value.push(filter);
  }

  function handleFilterRemoved(index: number): void {
    filters.value.splice(index, 1);
  }
</script>
