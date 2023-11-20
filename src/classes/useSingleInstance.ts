// TODO: find better way to type this
const instances: Map<() => any, any> = new Map();

export const useSingleInstance = <T>(getInstance: () => T): T => {
  const instance = instances.get(getInstance) as T | undefined;
  if (instance) {
    return instance;
  }

  const newInstance = getInstance();
  instances.set(getInstance, newInstance);

  return newInstance;
};
