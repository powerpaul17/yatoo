<template>
  <Sidebar
    :pt="{
      root: {
        class: 'h-auto max-w-5xl rounded-b-md'
      }
    }"
    :pt-options="{
      mergeProps: true
    }"
    position="top"
    v-model:visible="visible"
    @update="emit('close')"
  >
    <template #container>
      <div class="m-3">
        <InputGroup class="w-full">
          <InputText
            ref="creationStringInputElement"
            type="text"
            class="w-full"
            v-model="creationString"
          />
          <Button
            :disabled="!isValidInput"
            @click="handleCreateButtonClicked"
          >
            <template #icon="{ class: cls }">
              <Plus :class="cls" />
            </template>
          </Button>
        </InputGroup>
      </div>
    </template>
  </Sidebar>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import Sidebar from 'primevue/sidebar';
  import InputGroup from 'primevue/inputgroup';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';

  import { useTodoStore } from '../stores/todoStore';

  import { Plus } from 'lucide-vue-next';

  const todoStore = useTodoStore();

  const creationStringInputElement = ref(null);

  const props = defineProps({
    open: {
      type: Boolean,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
  }>();

  const visible = ref(false);

  watch(
    () => props.open,
    () => {
      visible.value = props.open;
    }
  );

  watch(visible, () => {
    if (!visible.value) emit('close');
  });

  const creationString = ref('');

  const isValidInput = computed(() => {
    return creationString.value.length;
  });

  async function handleCreateButtonClicked(): Promise<void> {
    await todoStore.create({
      title: creationString.value,
      description: '',
      done: false,
      doneAt: null
    });

    creationString.value = '';
  }
</script>
