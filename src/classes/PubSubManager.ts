export class PubSubManager<TMessages extends Messages> {
  private messages: Array<TMessages> = [];

  public registerMessages(messages: TMessages): { dispose: () => void } {
    this.messages.push(messages);

    return {
      dispose: (): void => {
        const index = this.messages.findIndex((m) => m === messages);
        if (index >= 0) this.messages.splice(index, 1);
      }
    };
  }

  public unregisterAllMessages(): void {
    this.messages = [];
  }

  public callMessages<TMessageName extends keyof TMessages>(
    messageName: TMessageName,
    ...args: Parameters<Exclude<TMessages[TMessageName], undefined>>
  ): void {
    this.messages.forEach((messages) => {
      const callback = messages[messageName];
      if (callback) callback.apply(messages, args);
    });
  }
}

type Messages = {
  [messageName: string]: ((...args: Array<any>) => void) | undefined;
};
