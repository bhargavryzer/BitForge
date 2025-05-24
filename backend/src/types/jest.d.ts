// Type definitions for Jest
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockImplementation(fn: (...args: Y) => T): this;
      mockReturnValue(value: T): this;
      mockResolvedValue(value: T): this;
      mockRejectedValue(value: any): this;
      mockReturnThis(): this;
      mockReturnValueOnce(value: T): this;
      mockResolvedValueOnce(value: T): this;
      mockRejectedValueOnce(value: any): this;
      mockReset(): void;
      mockClear(): void;
      mockRestore(): void;
    }
  }

  const jest: {
    fn: <T = any, Y extends any[] = any>() => jest.Mock<T, Y>;
    spyOn: <T extends {}, M extends keyof T>(object: T, method: M) => jest.Mock;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
  };

  function describe(name: string, fn: () => void): void;
  function beforeEach(fn: () => void): void;
  function afterEach(fn: () => void): void;
  function beforeAll(fn: () => void): void;
  function afterAll(fn: () => void): void;
  function it(name: string, fn: () => void): void;
  function expect(actual: any): any;
}

export {};
