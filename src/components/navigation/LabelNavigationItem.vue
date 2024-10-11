<template>
  <NavigationItem
    :title="
      label.name ||
      `(${$t('components.navigation.LabelNavigationItem.noLabelName')})`
    "
    :route="{
      name: 'todos',
      query: {
        filter_label: label.id
      }
    }"
    :badge-value="numberOfTodos"
    @button-click="openContextMenu($event)"
    @contextmenu="openContextMenu($event)"
  >
    <template #icon>
      <CustomIcon
        v-if="label.icon"
        :name="label.icon"
      />
      <Tag v-else />
    </template>

    <template #buttonIcon>
      <EllipsisVertical />
    </template>
  </NavigationItem>

  <LabelEditDialog
    :label="label"
    :open="labelEditDialogOpen"
    @close="labelEditDialogOpen = false"
    @delete="
      labelEditDialogOpen = false;
      deleteDialogOpen = true;
    "
    @save="handleLabelSaved"
  />

  <DeleteDialog
    :open="deleteDialogOpen"
    :title="
      $t('components.navigation.LabelNavigationItem.deleteLabelWithLabelName', {
        labelName: label.name
      })
    "
    @close="deleteDialogOpen = false"
    @delete="emit('delete')"
  />

  <ContextMenu
    ref="contextMenu"
    :model="menuItems"
  >
    <template #itemicon="{ item, class: cls }">
      <component
        :is="item.iconComponent"
        :class="cls"
      ></component>
    </template>
  </ContextMenu>
</template>

<script setup lang="ts">
  import { ref, type PropType, watch, computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import ContextMenu from 'primevue/contextmenu';

  import { useLabelStore, type Label } from '../../stores/labelStore';
  import { useTodoService } from '../../services/todoService';

  import { EllipsisVertical, Pen, Tag, Trash } from 'lucide-vue-next';

  import NavigationItem from './NavigationItem.vue';
  import CustomIcon from '../CustomIcon.vue';
  import LabelEditDialog from '../dialogs/LabelEditDialog.vue';
  import DeleteDialog from '../dialogs/DeleteDialog.vue';

  const { t } = useI18n();

  const labelStore = useLabelStore();
  const todoService = useTodoService();

  const contextMenu = ref();

  const menuItems = [
    {
      label: t('components.navigation.LabelNavigationItem.editLabel'),
      iconComponent: Pen,
      command: () => (labelEditDialogOpen.value = true)
    },
    {
      label: t('components.navigation.LabelNavigationItem.deleteLabel'),
      iconComponent: Trash,
      command: () => (deleteDialogOpen.value = true)
    }
  ];

  const props = defineProps({
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'delete'): void;
  }>();

  const labelId = ref(props.label.id);

  watch(
    () => props.label.id,
    () => {
      labelId.value = props.label.id;
    }
  );

  const todosOfLabel = todoService.getTodoRefForLabelId(labelId);

  const numberOfTodos = computed(() => {
    return todosOfLabel.value.filter((t) => !t.done).length;
  });

  const labelEditDialogOpen = ref(false);

  function openContextMenu(event: Event) {
    contextMenu.value.show(event);
  }

  async function handleLabelSaved(newProperties: {
    name: string;
    color: string;
    icon: string;
  }): Promise<void> {
    labelEditDialogOpen.value = false;

    await labelStore.update({
      id: props.label.id,
      name: newProperties.name,
      color: newProperties.color,
      icon: newProperties.icon
    });
  }

  const deleteDialogOpen = ref(false);
</script>
