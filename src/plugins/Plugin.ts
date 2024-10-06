import type { PluginInitOptions } from './PluginManager';

export abstract class Plugin {
  public abstract getPluginId(): string;

  public abstract init({ registerSettings }: PluginInitOptions): Promise<void>;
}
