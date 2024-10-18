// TODO: find better way to type this
const instances: Map<() => any, any> = new Map();

export const useSingleInstance = <T>(
  getInstance: () => T
): { instance: T; resetInstance: () => void } => {
  const instance = instances.get(getInstance) as T | undefined;

  const resetInstance = (): void => {
    instances.delete(getInstance);
  };

  if (instance) {
    return {
      instance,
      resetInstance
    };
  }

  const newInstance = getInstance();
  instances.set(getInstance, newInstance);

  return {
    instance: newInstance,
    resetInstance
  };
};
