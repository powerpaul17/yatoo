<template>
  <div class="bg-surface-300 p-2 dark:bg-surface-700">
    <div class="text-xl font-medium">
      <h2>{{ $t(section.labelTk) }}</h2>
    </div>
    <div class="">
      <SettingInput
        v-for="setting of section.settings"
        :key="setting.name"
        :setting-definition="setting"
        :section="section.name"
        class="my-2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';

  import SettingInput from './SettingInput.vue';

  import type { SettingsConfig } from '../../types/SettingsTypes';

  defineProps({
    section: {
      type: Object as PropType<SettingsConfig>,
      required: true
    }
  });
</script>
