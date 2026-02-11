import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export const multiplyBy = (factor: number): MonoTypeOperatorFunction<number> => {
  return map((value) => value * factor);
};

export const labelWith = (prefix: string): OperatorFunction<unknown, string> => {
  return map((value) => `${prefix}${value}`);
};
