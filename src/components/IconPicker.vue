<template>
  <div>
    <Select
      v-model="selectedIcon"
      :options="Object.entries(icons)"
      :option-value="([key]) => key"
      :option-label="([key]) => key"
      show-clear
      @change="emit('update:modelValue', selectedIcon)"
      pt:root="flex w-full"
    >
      <template #value="{ value }">
        <div class="flex">
          <component
            :is="icons[value] ?? Tag"
            class="mr-2"
          />
          <div>{{ value ?? 'Tag' }}</div>
        </div>
      </template>

      <template #option="{ option: [key, i] }">
        <div class="flex">
          <component
            :is="i"
            class="mr-2"
          />
          <div>{{ key }}</div>
        </div>
      </template>
    </Select>
  </div>
</template>

<script setup lang="ts">
  import { ref, type PropType, watch } from 'vue';

  import Select from 'primevue/select';

  import {
    Archive,
    AtSign,
    Baby,
    Building,
    Car,
    Heart,
    Home,
    Inbox,
    Laptop,
    LifeBuoy,
    Mail,
    Moon,
    PcCase,
    Phone,
    Server,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Sun,
    Tag
  } from 'lucide-vue-next';

  const icons = {
    Archive,
    AtSign,
    Baby,
    Building,
    Car,
    Heart,
    Home,
    Inbox,
    Laptop,
    LifeBuoy,
    Mail,
    Moon,
    PcCase,
    Phone,
    Server,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Sun
  };

  const props = defineProps({
    modelValue: {
      type: Object as PropType<string | null>,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'update:modelValue', icon: string | null): void;
  }>();

  const selectedIcon = ref(props.modelValue);
</script>
