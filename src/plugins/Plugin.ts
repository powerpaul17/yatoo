export abstract class Plugin {
  public abstract getPluginId(): string;

  public abstract init(): Promise<void>;
}
