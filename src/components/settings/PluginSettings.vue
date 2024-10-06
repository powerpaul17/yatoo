<template>
  <template v-for="section of pluginSettings">
    <SettingsSection
      v-if="section"
      :key="section.name"
      :section="section"
      class="my-2"
    />
  </template>
</template>

<script setup lang="ts">
  import { inject } from 'vue';

  import SettingsSection from './SettingsSection.vue';
  import { PluginManagerKey } from '../../provideKeys';

  const pluginManager = inject(PluginManagerKey);

  const pluginSettings = pluginManager?.getSettings();
</script>
