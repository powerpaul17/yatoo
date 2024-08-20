<template>
  <DialogComponent
    :title="$t('components.dialogs.LabelEditDialog.title')"
    :open="open"
    @close="emit('close')"
  >
    <template #default>
      <div class="my-4 flex flex-col">
        <label>
          {{ $t('entities.label.name') }}
        </label>
        <InputText v-model="name" />
      </div>

      <div class="my-4 flex flex-col">
        <label>
          {{ $t('entities.label.color') }}
        </label>
        <InputGroup>
          <InputGroupAddon class="basis-0 !p-0">
            <ColorPicker
              v-model="color"
              pt:root="h-full rounded-[inherit]"
              pt:preview="w-full h-full rounded-[inherit] border-0"
            />
          </InputGroupAddon>
          <InputText
            v-model="color"
            class="flex-auto"
          />
        </InputGroup>
      </div>

      <div class="my-4 flex flex-col">
        <label>
          {{ $t('entities.label.icon') }}
        </label>
        <IconPicker v-model="icon" />
      </div>
    </template>

    <template #actions>
      <Button
        severity="warn"
        :label="$t('components.dialogs.LabelEditDialog.delete')"
        @click="emit('delete')"
      >
        <template #icon="{ class: cls }">
          <Trash :class="cls" />
        </template>
      </Button>

      <Button
        :label="$t('components.dialogs.LabelEditDialog.save')"
        @click="
          emit('save', {
            name,
            color,
            icon
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
  import { ref, type PropType } from 'vue';

  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  import ColorPicker from 'primevue/colorpicker';
  import InputGroup from 'primevue/inputgroup';
  import InputGroupAddon from 'primevue/inputgroupaddon';

  import type { Label } from '../../stores/labelStore';

  import { Save, Trash } from 'lucide-vue-next';

  import DialogComponent from './DialogComponent.vue';
  import IconPicker from '../IconPicker.vue';

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    label: {
      type: Object as PropType<Label>,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'delete'): void;
    (
      event: 'save',
      labelProperties: {
        name: string;
        color: string;
        icon: string;
      }
    ): void;
  }>();

  const name = ref(props.label.name);
  const color = ref(props.label.color);
  const icon = ref(props.label.icon);
</script>
