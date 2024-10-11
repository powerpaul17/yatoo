const eventSubscriberMap: Map<
  string,
  Array<(payload: any) => void>
> = new Map();

export const useGlobalMessageBus = (): {
  emit: (eventName: string, payload: any) => void;
  subscribe: (
    eventName: string,
    callback: (payload: any) => void
  ) => { dispose: () => void };
} => {
  return {
    emit: (eventName, payload): void => {
      const subscribers = eventSubscriberMap.get(eventName);

      if (!subscribers) return;

      subscribers.forEach((c) => c(payload));
    },
    subscribe: (eventName, callback): { dispose: () => void } => {
      const subscribers = eventSubscriberMap.get(eventName);

      if (subscribers) {
        subscribers.push(callback);
      } else {
        eventSubscriberMap.set(eventName, [callback]);
      }

      return {
        dispose: (): void => {
          const subscribers = eventSubscriberMap.get(eventName);

          if (!subscribers) return;

          const index = subscribers.findIndex((c) => c === callback);

          if (index) {
            subscribers.splice(index, 1);
          }
        }
      };
    }
  };
};
