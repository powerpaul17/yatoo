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

}

type RateLimitedFunction<F extends (...args: Array<any>) => void | Promise<void>> = {
  (...args: Parameters<F>): ReturnType<F>;
  _timeout: number|null;
  _lastArguments: Parameters<F> | null;

  _callCallback: () => void;
}
