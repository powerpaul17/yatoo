import { describe, expect, it } from 'bun:test';

import {
  MessageBus,
  type MessageConfig,
  MessageAlreadyRegisteredError
} from './MessageBus';

describe('MessageBus', () => {
  describe('registerMessage', () => {
    it('should register a message and return a notifier', () => {
      const { messageBus } = setupEnvironment();

      const registerResult =
        messageBus.registerMessage<MessageConfig<'new-message', any>>(
          'new-message'
        );

      expect(registerResult.notify).toBeFunction();
      expect(registerResult.dispose).toBeFunction();
    });

    it('should throw an exception if message is already registered', () => {
      const { messageBus } = setupEnvironment();

      expect(() => {
        messageBus.registerMessage<TestMessageConfig>('test-message');
      }).toThrow(MessageAlreadyRegisteredError);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to a message and get notified', async () => {
      const { messageBus, notify } = setupEnvironment();

      let notified = 0;
      messageBus.subscribe<TestMessageConfig>('test-message', () => {
        notified++;
        return Promise.resolve();
      });

      await notify({});

      expect(notified).toBe(1);
    });

    it('should not receive further messages if unsubscribed', async () => {
      const { messageBus, notify } = setupEnvironment();

      let notified = 0;
      const { dispose } = messageBus.subscribe<TestMessageConfig>(
        'test-message',
        () => {
          notified++;
          return Promise.resolve();
        }
      );

      await notify({});

      dispose();

      await notify({});

      expect(notified).toBe(1);
    });

    it('should not receive a unsubscribed message', async () => {
      const { messageBus, notify } = setupEnvironment();

      messageBus.registerMessage<MessageConfig<'test-message-2', any>>(
        'test-message-2'
      );

      let notified = 0;
      messageBus.subscribe<MessageConfig<'test-message-2', any>>(
        'test-message-2',
        () => {
          notified++;
          return Promise.resolve();
        }
      );

      await notify({});

      expect(notified).toBe(0);
    });

    it('should subscribe to a message which has not been registered yet', async () => {
      const { messageBus } = setupEnvironment();

      let notified = 0;
      messageBus.subscribe<MessageConfig<'not-existing-message', any>>(
        'not-existing-message',
        () => {
          notified++;
          return Promise.resolve();
        }
      );

      const { notify } = messageBus.registerMessage<
        MessageConfig<'not-existing-message', any>
      >('not-existing-message');

      await notify({});

      expect(notified).toBe(1);
    });
  });

  function setupEnvironment(): {
    messageBus: MessageBus;
    notify: (payload: any) => Promise<Array<void>>;
  } {
    const messageBus = new MessageBus();

    const { notify } =
      messageBus.registerMessage<TestMessageConfig>('test-message');

    return {
      messageBus,
      notify
    };
  }
});

type TestMessageConfig = MessageConfig<'test-message', any>;
