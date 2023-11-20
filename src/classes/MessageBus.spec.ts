import { describe, expect, it } from 'bun:test';

import {
  MessageBus,
  MessageNotRegisteredError,
  type MessageConfig
} from './MessageBus';

describe('MessageBus', () => {
  describe('subscribe', () => {
    it('should subscribe to a message and get notified', async () => {
      const { messageBus, notify } = setupEnvironment();

      let notified = 0;
      messageBus.subscribe('test-message', () => {
        notified++;
        return Promise.resolve();
      });

      await notify({});

      expect(notified).toBe(1);
    });

    it('should not receive further messages if unsubscribed', async () => {
      const { messageBus, notify } = setupEnvironment();

      let notified = 0;
      const { dispose } = messageBus.subscribe('test-message', () => {
        notified++;
        return Promise.resolve();
      });

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
      messageBus.subscribe('test-message-2', () => {
        notified++;
        return Promise.resolve();
      });

      await notify({});

      expect(notified).toBe(0);
    });

    it('should throw if trying to subscribe to a not existing message', async () => {
      const { messageBus } = setupEnvironment();

      let notified = 0;
      expect(() => {
        messageBus.subscribe('not-existing-message', () => {
          notified++;
          return Promise.resolve();
        });
      }).toThrow(MessageNotRegisteredError);
    });
  });

  function setupEnvironment(): {
    messageBus: MessageBus;
    notify: (payload: any) => Promise<Array<void>>;
  } {
    const messageBus = new MessageBus();

    const { notify } =
      messageBus.registerMessage<MessageConfig<'test-message', any>>(
        'test-message'
      );

    return {
      messageBus,
      notify
    };
  }
});
