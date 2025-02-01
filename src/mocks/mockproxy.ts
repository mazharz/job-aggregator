export type MockType<T> = {
  [P in keyof T]: jest.Mock;
};
export const MockProxy = <T>(): MockType<T> => {
  return new Proxy(
    {},
    {
      get(target: object, property: PropertyKey, receiver: any): any {
        if (property === 'then') {
          return Promise.resolve();
        }
        if (property in target) {
          return target[property];
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const fn = jest.fn(() => receiver);
        target[property] = fn;
        return fn;
      },
    },
  ) as MockType<T>;
};
