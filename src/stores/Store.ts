import { BaseStore } from './BaseStore';

export class Store<T extends Entity> extends BaseStore<T> {

  constructor(tableName: string) {
    super(tableName, {});
  }

}

export type Entity = {
  id: string;
  pluginId?: string;
}
