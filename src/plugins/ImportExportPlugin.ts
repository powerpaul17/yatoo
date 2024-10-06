import { Device } from '@capacitor/device';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

import { useI18n } from 'vue-i18n';

import dayjs from 'dayjs';

import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

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

  private toast = useToast();
  private confirm = useConfirm();

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

                    const exportData = await this.storageManager.exportData();

                    if (parsedData.lastUpdatedAt < exportData.lastUpdatedAt) {
                      const overwrite = await new Promise<boolean>(
                        (res, rej) => {
                          this.confirm.require({
                            header: this.t(
                              'plugins.importExportPlugin.overwrite'
                            ),
                            message: `${this.t(
                              'plugins.importExportPlugin.storedDataNewerThanImportData'
                            )}:\n\nStore updated: ${dayjs(
                              exportData.lastUpdatedAt
                            ).format('L LT')}\nImport data updated: ${dayjs(
                              parsedData.lastUpdatedAt
                            ).format('L LT')}`,
                            acceptProps: {
                              label: this.t(
                                'plugins.importExportPlugin.overwrite'
                              ),
                              severity: 'warn'
                            },
                            accept: () => {
                              res(true);
                            },
                            reject: () => {
                              res(false);
                            }
                          });
                        }
                      );

                      if (!overwrite) return;
                    }

                    await this.storageManager.importData(parsedData);

                    this.toast.add({
                      summary: this.t(
                        'plugins.importExportPlugin.importSuccessful'
                      ),
                      life: 5000
                    });
                  } catch (error) {
                    this.toast.add({
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

                  await this.downloadFile(
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

  private async downloadFile(content: string, fileName: string): Promise<void> {
    const deviceInfo = await Device.getInfo();

    if (deviceInfo.platform === 'web') {
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
    } else {
      const result = await Filesystem.writeFile({
        data: content,
        encoding: Encoding.UTF8,
        path: fileName,
        directory: Directory.Documents
      });

      this.toast.add({
        summary: this.t('plugins.importExportPlugin.fileSaved'),
        detail: result.uri,
        life: 5000
      });
    }
  }
}
