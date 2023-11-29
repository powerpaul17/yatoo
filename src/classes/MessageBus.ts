import { useSingleInstance } from './useSingleInstance';

const createMessageBus = (): MessageBus => new MessageBus();

export const useMessageBus = (): MessageBus => {
  return useSingleInstance(createMessageBus);
};

export class MessageBus {
  private messages: Map<string, MessageInfo<any>> = new Map();

  public registerMessage<
    TConfig extends MessageConfig<string, any, any> = never
  >(
    message: TConfig['message']
  ): Disposable & {
    notify: (
      payload: TConfig['payload']
    ) => Promise<Array<TConfig['returnValue']>>;
  } {
    const messageInfo = this.getOrCreateMessageInfo(message);

    if (messageInfo.registered) throw new MessageAlreadyRegisteredError();

    messageInfo.registered = true;

    return {
      dispose: (): void => {
        messageInfo.registered = false;
      },
      notify: (payload): Promise<Array<TConfig['returnValue']>> => {
        if (!messageInfo.registered) throw new MessageNotRegisteredError();

        return Promise.all(
          Array.from(messageInfo.subscribers.values()).map((s) => s(payload))
        );
      }
    };
  }

  public subscribe<TConfig extends MessageConfig<string, any, any> = never>(
    message: TConfig['message'],
    callback: Subscriber<TConfig['payload'], TConfig['returnValue']>
  ): Disposable {
    const messageInfo = this.getOrCreateMessageInfo(message);

    messageInfo.subscribers.add(callback);

    return {
      dispose: (): void => {
        messageInfo.subscribers.delete(callback);
      }
    };
  }

  private getOrCreateMessageInfo<TConfig extends MessageConfig<string, any>>(
    message: TConfig['message']
  ): MessageInfo<TConfig['payload'], TConfig['returnValue']> {
    const existingMessageInfo = this.messages.get(message);
    if (existingMessageInfo) return existingMessageInfo;

    const messageInfo = {
      registered: false,
      subscribers: new Set<Subscriber<any>>()
    };
    this.messages.set(message, messageInfo);

    return messageInfo;
  }
}

export class MessageAlreadyRegisteredError extends Error {
  constructor() {
    super('message already registered');
  }
}

export class MessageNotRegisteredError extends Error {
  constructor() {
    super('message not registered');
  }
}

type Disposable = {
  dispose: () => void;
};

type Subscriber<TPayload, TReturnValue = void> = (
  payload: TPayload
) => Promise<TReturnValue>;

export type MessageConfig<TMessage, TPayload, TReturnValue = void> = {
  message: TMessage;
  payload: TPayload;
  returnValue: TReturnValue;
};

type MessageInfo<TPayload, TReturnValue = void> = {
  registered: boolean;
  subscribers: Set<Subscriber<TPayload, TReturnValue>>;
};
