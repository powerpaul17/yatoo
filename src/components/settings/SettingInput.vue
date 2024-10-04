<template>
  <div>
    <component :is="getComponentForType(settingDefinition)"></component>
  </div>
</template>

<script setup lang="ts">
  import { type PropType, type Component } from 'vue';

  import { type SettingDefinition } from '../../types/SettingsTypes';

  defineProps({
    settingDefinition: {
      type: Object as PropType<SettingDefinition>,
      required: true
    }
  });

  function getComponentForType(definition: SettingDefinition): Component {
    switch (definition.type) {
      default:
        throw new Error(
          `component for setting input type ${definition.type} not implemented`
        );
    }
  }
</script>
