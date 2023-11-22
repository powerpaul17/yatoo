export class Utils {

  public static rateLimitFunction<F extends (...args: Array<any>) => void | Promise<void>>(
    func: F,
    rate = 200
  ): RateLimitedFunction<F> {
    const f: RateLimitedFunction<F> = function () {
      f._lastArguments = arguments as unknown as Parameters<F>;

      if (!f._timeout) {
        const id = window.setTimeout(() => {
          f._timeout = null;
          f._callCallback();
        }, rate);

        f._timeout = id;
      }
    };

    f._callCallback = (): void => {
      if (f._lastArguments) {
        void func.apply(window, f._lastArguments);
      }

      f._lastArguments = null;
    };

    f._timeout  = null;
    f._lastArguments = null;

    return f;
  }

  public static computeArrayElementDifferences<T>(
    array1: Array<T>,
    array2: Array<T>,
    compareFunction: (item1: T, item2: T) => boolean
  ): {
    onlyInArray1: Array<T>;
    onlyInArray2: Array<T>;
  } {
    const array1Copy = array1.slice();
    const array2Copy = array2.slice();

    const onlyInArray1: Array<T> = [];

    while (array1Copy.length) {
      const item1 = array1Copy.shift();
      if (item1 == null) continue;

      const foundItem2Index = array2Copy.findIndex((item2) => {
        return compareFunction(item1, item2);
      });

      if (foundItem2Index >= 0) {
        array2Copy.splice(foundItem2Index, 1);
      } else {
        onlyInArray1.push(item1);
      }
    }

    return {
      onlyInArray1,
      onlyInArray2: array2Copy
    };
  }
}

type RateLimitedFunction<F extends (...args: Array<any>) => void | Promise<void>> = {
  (...args: Parameters<F>): ReturnType<F>;
  _timeout: number|null;
  _lastArguments: Parameters<F> | null;

  _callCallback: () => void;
}
