import sinon from 'sinon';

import {
  type CreationEntity,
  type Entity,
  type Migration,
  Store,
  type UpdateEntity
} from './Store';

export class TestStore extends Store<'test', TestEntity> {
  public migrationSpy;

  constructor({ version }: { version: number }) {
    const migrationSpy = sinon.spy<Migration<TestEntity>>((entities) => {
      return entities.map((entity) => {
        return {
          id: entity.id,
          testValue: entity.testValue ?? 'test',
          createdAt: entity.createdAt ?? Date.now(),
          updatedAt: entity.updatedAt ?? Date.now()
        };
      });
    });

    super({
      tableName: 'test',
      migrationConfig: {
        version,
        migrationFunction: migrationSpy
      }
    });

    this.migrationSpy = migrationSpy;
  }

  public awaitReady(): Promise<void> {
    return this.initializePromise;
  }

  public async create(item: CreationEntity<TestEntity>): Promise<string> {
    return await this._create(item);
  }

  public async update(item: UpdateEntity<TestEntity>): Promise<void> {
    await this._update(item);
  }
}

export type TestEntity = Entity & {
  testValue: string;
};
