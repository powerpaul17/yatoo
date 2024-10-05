<template>
  <div>
    <component :is="getComponentForType(settingDefinition)"></component>
  </div>
</template>

<script setup lang="ts">
  import { type PropType, type Component, h } from 'vue';
  import { useI18n } from 'vue-i18n';

  import Button from 'primevue/button';
  import FileUpload, {
    type FileUploadUploaderEvent
  } from 'primevue/fileupload';

  import SettingInput from './SettingInput.vue';

  import {
    SettingInputType,
    type SettingDefinition
  } from '../../types/SettingsTypes';

  const { t } = useI18n();

  defineProps({
    settingDefinition: {
      type: Object as PropType<SettingDefinition>,
      required: true
    }
  });

  function getComponentForType(definition: SettingDefinition): Component {
    switch (definition.type) {
      case SettingInputType.BUTTON:
        return h(Button, {
          label: definition.labelTk ? t(definition.labelTk) : '',
          onClick: definition.handler
        });

      case SettingInputType.FILE:
        return h(FileUpload, {
          mode: 'basic',
          auto: true,
          customUpload: true,
          chooseLabel: definition.labelTk ? t(definition.labelTk) : undefined,
          accept: definition.accept,
          onUploader: (event: FileUploadUploaderEvent) => {
            const file = Array.isArray(event.files)
              ? event.files[0]
              : event.files;
            if (!file) throw new Error('no file selected');

            void definition.handler(file);
          }
        });

      case SettingInputType.INPUT_GROUP:
        return h(
          'div',
          { class: 'flex gap-2' },
          definition.children.map((def) =>
            h(SettingInput, { key: def.name, settingDefinition: def })
          )
        );

      default:
        throw new Error(
          `component for setting input type ${definition.type} not implemented`
        );
    }
  }
</script>
