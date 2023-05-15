export function Singleton<T extends new (...args: any[]) => any>(ctr: T): T {
  let instance: T;

  return class {
    constructor(...args: any[]) {
      if (!instance) {
        instance = new ctr(...args);
      }

      return instance;
    }
  } as T;
};
