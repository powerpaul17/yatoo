<template>
  <div class="flex flex-col items-center">
    <div
      id="plugin-settings"
      class="my-8 text-center text-lg"
    >
      {{ $t('views.settings.plugins') }}
    </div>

    <PluginSettings />
  </div>
</template>

<script setup lang="ts">
  import PluginSettings from '../components/settings/PluginSettings.vue';
</script>
