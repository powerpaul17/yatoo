import { useMessageBus, type MessageConfig } from '../classes/MessageBus';
import type { Entity } from '../stores/Store';
import { Plugin } from './Plugin';

export class ImportExportPlugin extends Plugin {
  public getPluginId(): string {
    return 'import-export';
  }

  public async init(): Promise<void> {
    const messageBus = useMessageBus();

    const { notify: notifyExport } = messageBus.registerMessage<
      ExportMessage<any>
    >('import-export::export');
    return Promise.resolve();
  }
}

export type ExportMessage<TEntity extends Entity> = MessageConfig<
  'import-export::export',
  void,
  { entityName: string; entities: Array<TEntity> }
>;
