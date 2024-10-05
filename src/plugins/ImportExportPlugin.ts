import { useI18n } from 'vue-i18n';

import { useToast } from 'primevue/usetoast';

import {
  ZodImportExportFormat,
  useStorageManager
} from '../stores/StorageManager';
import { SettingInputType } from '../types/SettingsTypes';
import { Plugin } from './Plugin';
import type { PluginInitOptions } from './PluginManager';
import { Logger } from '../classes/Logger';

export class ImportExportPlugin extends Plugin {
  private t;

  private storageManager = useStorageManager();

  constructor() {
    super();

    const { t } = useI18n();
    this.t = t;
  }

  public getPluginId(): string {
    return 'importExportPlugin';
  }

  public async init({ registerSettings }: PluginInitOptions): Promise<void> {
    const toast = useToast();

    registerSettings([
      {
        name: this.getPluginId(),
        labelTk: 'plugins.importExportPlugin.label',
        settings: {
          importExportButtons: {
            name: 'importExportButtons',
            type: SettingInputType.INPUT_GROUP,
            children: [
              {
                name: 'import',
                type: SettingInputType.FILE,
                labelTk: 'plugins.importExportPlugin.import',
                accept: 'application/json',
                handler: async (file): Promise<void> => {
                  const fileContents = await new Promise<string>((res, rej) => {
                    const reader = new FileReader();

                    reader.onload = (): void => {
                      res(reader.result as string);
                    };

                    reader.onerror = (err): void => {
                      rej(err);
                    };

                    reader.readAsText(file);
                  });

                  try {
                    const data = JSON.parse(fileContents) as unknown;

                    const parsedData = ZodImportExportFormat.parse(data);

                    await this.storageManager.importData(parsedData);

                    toast.add({
                      summary: this.t(
                        'plugins.importExportPlugin.importSuccessful'
                      ),
                      life: 5000
                    });
                  } catch (error) {
                    toast.add({
                      summary: this.t('errors.wrongFileFormat'),
                      severity: 'error'
                    });

                    Logger.error(
                      this.getPluginId(),
                      'wrong file format',
                      error
                    );
                  }
                }
              },
              {
                name: 'export',
                labelTk: 'plugins.importExportPlugin.export',
                type: SettingInputType.BUTTON,
                handler: async (): Promise<void> => {
                  const exportData = await this.storageManager.exportData();

                  this.downloadFile(
                    JSON.stringify(exportData, undefined, 2),
                    `yatoo-export-${exportData.exportedAt}.json`
                  );
                }
              }
            ]
          }
        }
      }
    ]);

    return Promise.resolve();
  }

  private downloadFile(content: string, fileName: string): void {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    );
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
