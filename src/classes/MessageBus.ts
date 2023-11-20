let messageBus: MessageBus | null = null;

export const useMessageBus = (): MessageBus => {
  if (!messageBus) messageBus = new MessageBus();

  return messageBus;
};

export class MessageBus {
  private messages: Map<string, Set<Subscriber>> = new Map();

  public registerMessage(message: string): Disposable & {
    notify: (payload) => Promise<Array<void>>;
  } {
    if (this.messages.has(message)) throw new MessageAlreadyRegisteredError();

    const subscribers = new Set<Subscriber>();
    this.messages.set(message, subscribers);

    return {
      dispose: (): void => {
        this.messages.delete(message);
      },
      notify: (payload): Promise<Array<void>> => {
        return Promise.all(
          Array.from(subscribers.values()).map((s) => s(payload))
        );
      }
    };
  }

  public subscribe(message: string, callback: Subscriber): Disposable {
    const subscribers = this.messages.get(message);
    if (!subscribers) throw new MessageNotRegisteredError();

    subscribers.add(callback);

    return {
      dispose: (): void => {
        subscribers.delete(callback);
      }
    };
  }
}

export class MessageAlreadyRegisteredError extends Error {
  constructor() {
    super('message already registered');
  }
}

export class MessageNotRegisteredError extends Error {
  constructor() {
    super('message is not registered');
  }
}

type Disposable = {
  dispose: () => void;
};

type Subscriber = (payload) => Promise<void>;
