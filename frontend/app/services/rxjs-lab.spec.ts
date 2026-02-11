import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

import { multiplyBy } from './rxjs-lab.operators';

describe('RxJS Lab - TestScheduler', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('applique un operateur custom', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('-a-b-|', { a: 1, b: 2 });
      const result$ = source$.pipe(multiplyBy(10));

      expectObservable(result$).toBe('-a-b-|', { a: 10, b: 20 });
    });
  });

  it('bascule vers un fallback en cas d erreur', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('-a-#', { a: 'ok' }, new Error('boom'));
      const result$ = source$.pipe(catchError(() => of('fallback')));

      expectObservable(result$).toBe('-a-(f|)', { a: 'ok', f: 'fallback' });
    });
  });

  it('switchMap annule les observables precedents', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('-a--b----|');
      const inner$ = cold('---x|');
      const result$ = source$.pipe(switchMap(() => inner$));

      expectObservable(result$).toBe('-------x-|');
    });
  });
});
