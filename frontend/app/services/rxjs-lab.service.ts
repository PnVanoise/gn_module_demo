import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Observer,
  Subject,
  combineLatest,
  concat,
  defer,
  from,
  iif,
  interval,
  merge,
  of,
  partition,
  throwError,
  timer,
  zip,
} from 'rxjs';
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  delay,
  exhaustMap,
  filter,
  finalize,
  first,
  map,
  materialize,
  mergeMap,
  reduce,
  retry,
  scan,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
  toArray,
} from 'rxjs/operators';

import { labelWith, multiplyBy } from './rxjs-lab.operators';

export type OperatorSimulationKey =
  | 'switchMap'
  | 'mergeMap'
  | 'concatMap'
  | 'exhaustMap'
  | 'filter'
  | 'iif'
  | 'takeWhile'
  | 'defaultIfEmpty'
  | 'map'
  | 'scan'
  | 'reduce';

export type FilterSimulationMode = 'even' | 'odd' | 'gte';

export interface OperatorSimulationEvent {
  t: number;
  lane: 'source' | 'output' | 'info';
  value: string;
}

export type HotColdSimulationMode = 'cold' | 'hot' | 'shareReplay';

export interface HotColdSimulationEvent {
  t: number;
  lane: 'subA' | 'subB' | 'info';
  value: string;
}

export type CombinationSimulationKey = 'combineLatest' | 'merge' | 'zip' | 'partition';

export interface OperatorSimulationPreview {
  label: string;
  description: string;
  source: Array<{ value: string | number; delay: number }>;
  inner?: Array<{ value: string | number; delay: number }>;
}

export interface OperatorSimulationOverrides {
  source?: Array<{ value: string | number; delay: number }>;
  inner?: Array<{ value: string | number; delay: number }>;
  filterMode?: FilterSimulationMode;
  filterThreshold?: number;
  iifCacheValue?: string;
  iifApiValue?: string;
  iifDelay?: number;
}

@Injectable({ providedIn: 'root' })
export class RxjsLabService {
  private readonly _higherOrderSource = [
    { value: 'A', delay: 0 },
    { value: 'B', delay: 120 },
    { value: 'C', delay: 120 },
  ];
  private readonly _higherOrderInner = [
    { value: 'A', delay: 300 },
    { value: 'B', delay: 200 },
    { value: 'C', delay: 100 },
  ];
  private readonly _numericSource = [
    { value: 1, delay: 0 },
    { value: 2, delay: 120 },
    { value: 3, delay: 120 },
    { value: 4, delay: 120 },
  ];

  observerPatternLogs$(): Observable<string[]> {
    const source$ = new Observable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.complete();
    });

    return source$.pipe(
      materialize(),
      map((notification) => {
        if (notification.kind === 'N') {
          return `next:${notification.value}`;
        }
        if (notification.kind === 'E') {
          return `error:${notification.error}`;
        }
        return 'complete';
      }),
      toArray()
    );
  }

  observableContractLogs$(): Observable<string[]> {
    const success$ = of('ok').pipe(
      materialize(),
      map((notification) => {
        if (notification.kind === 'N') {
          return `next:${notification.value}`;
        }
        if (notification.kind === 'E') {
          return `error:${notification.error}`;
        }
        return 'complete';
      })
    );

    const error$ = throwError(() => new Error('boom')).pipe(
      materialize(),
      map((notification) => {
        if (notification.kind === 'E') {
          return `error:${notification.error?.message ?? notification.error}`;
        }
        if (notification.kind === 'N') {
          return `next:${notification.value}`;
        }
        return 'complete';
      })
    );

    return concat(success$, error$).pipe(toArray());
  }

  manualObservable$(): Observable<number> {
    return new Observable<number>((observer) => {
      observer.next(10);
      observer.next(20);
      observer.complete();
    });
  }

  fromData$(): Observable<number> {
    return from([1, 2, 3, 4]);
  }

  fromPromise$(): Observable<string> {
    return defer(() => Promise.resolve('promise:resolved'));
  }

  lazyEvaluation$(): Observable<string> {
    return defer(() => of('lazy:executed'));
  }

  wrapTimeout$(): Observable<string> {
    return new Observable<string>((observer) => {
      const handle = setTimeout(() => {
        observer.next('timeout:done');
        observer.complete();
      }, 300);
      return () => clearTimeout(handle);
    });
  }

  filterOperators$(): Observable<number> {
    return from([1, 2, 3, 4, 5, 6]).pipe(filter((value) => value % 2 === 0));
  }

  conditionalOperators$(): Observable<string> {
    const choice$ = iif(
      () => true,
      of('iif:cache'),
      of('iif:api')
    );
    const guarded$ = from([1, 2, 3, 4]).pipe(
      takeWhile((value) => value < 3),
      map((value) => `takeWhile:${value}`)
    );
    const fallback$ = EMPTY.pipe(defaultIfEmpty('defaultIfEmpty:used'));

    return concat(choice$, guarded$, fallback$);
  }

  transformOperators$(): Observable<string> {
    return from([1, 2, 3]).pipe(
      map((value) => value * 10),
      switchMap((value) => of(`map:${value}`, `switchMap:${value + 1}`))
    );
  }

  aggregationOperators$(): Observable<string> {
    const scan$ = from([1, 2, 3]).pipe(
      scan((acc, value) => acc + value, 0),
      map((value) => `scan:${value}`)
    );
    const reduce$ = from([1, 2, 3]).pipe(
      reduce((acc, value) => acc + value, 0),
      map((value) => `reduce:${value}`)
    );

    return concat(scan$, reduce$);
  }

  utilityOperators$(): Observable<string> {
    const values$ = of('A', 'B').pipe(
      delay(50),
      tap(() => undefined),
      map((value) => `value:${value}`),
      finalize(() => undefined)
    );

    return concat(values$, of('finalize'));
  }

  customOperator$(): Observable<number> {
    return from([1, 2, 3]).pipe(multiplyBy(10));
  }

  operatorPipeline$(): Observable<string> {
    return from([1, 2, 3, 4]).pipe(
      filter((value) => value % 2 === 0),
      multiplyBy(5),
      labelWith('pipeline:'),
      startWith('pipeline:start')
    );
  }

  hotColdExamples(): {
    coldA$: Observable<number[]>;
    coldB$: Observable<number[]>;
    hotA$: Observable<number[]>;
    hotB$: Observable<number[]>;
    shareReplayLate$: Observable<number[]>;
    subjectLogs$: Observable<string[]>;
  } {
    const coldSource$ = interval(200).pipe(take(4));
    const coldA$ = coldSource$.pipe(toArray());
    const coldB$ = timer(300).pipe(switchMap(() => coldSource$.pipe(toArray())));

    const hotSource$ = interval(200).pipe(take(6), share());
    const hotA$ = hotSource$.pipe(take(4), toArray());
    const hotB$ = timer(300).pipe(switchMap(() => hotSource$.pipe(take(4), toArray())));

    const replaySource$ = interval(200).pipe(take(4), shareReplay({ bufferSize: 1, refCount: true }));
    const shareReplayLate$ = timer(450).pipe(switchMap(() => replaySource$.pipe(take(3), toArray())));

    return {
      coldA$,
      coldB$,
      hotA$,
      hotB$,
      shareReplayLate$,
      subjectLogs$: of(this.subjectMulticastLogs()),
    };
  }

  subjectMulticastLogs(): string[] {
    const subject = new Subject<number>();
    const logs: string[] = [];

    subject.subscribe((value) => logs.push(`A:${value}`));
    subject.next(1);
    subject.subscribe((value) => logs.push(`B:${value}`));
    subject.next(2);
    subject.complete();

    const behavior = new BehaviorSubject<number>(0);
    behavior.subscribe((value) => logs.push(`Behavior:A:${value}`));
    behavior.next(3);
    behavior.subscribe((value) => logs.push(`Behavior:B:${value}`));
    behavior.complete();

    return logs;
  }

  combinationExamples(): {
    combineLatest$: Observable<string[]>;
    merge$: Observable<string[]>;
    zip$: Observable<string[]>;
  } {
    const numbers$ = from([1, 2, 3]);
    const letters$ = from(['A', 'B', 'C']);

    return {
      combineLatest$: combineLatest([numbers$, letters$]).pipe(
        map(([n, letter]) => `${n}${letter}`),
        toArray()
      ),
      merge$: merge(
        numbers$.pipe(map((value) => `n:${value}`)),
        letters$.pipe(map((value) => `l:${value}`))
      ).pipe(toArray()),
      zip$: zip(numbers$, letters$).pipe(
        map(([n, letter]) => `${n}-${letter}`),
        toArray()
      ),
    };
  }

  partitionExamples(): { even$: Observable<number[]>; odd$: Observable<number[]> } {
    const source$ = from([1, 2, 3, 4, 5, 6]);
    const [even$, odd$] = partition(source$, (value) => value % 2 === 0);

    return {
      even$: even$.pipe(toArray()),
      odd$: odd$.pipe(toArray()),
    };
  }

  higherOrderExamples(): {
    mergeMap$: Observable<number[]>;
    concatMap$: Observable<number[]>;
    switchMap$: Observable<number[]>;
    exhaustMap$: Observable<number[]>;
  } {
    const outer$ = from([1, 2, 3]);
    const makeInner = (value: number) => of(value).pipe(delay((4 - value) * 100));

    return {
      mergeMap$: outer$.pipe(mergeMap(makeInner), toArray()),
      concatMap$: outer$.pipe(concatMap(makeInner), toArray()),
      switchMap$: outer$.pipe(switchMap(makeInner), toArray()),
      exhaustMap$: outer$.pipe(exhaustMap(makeInner), toArray()),
    };
  }

  errorHandlingExamples(): {
    retry$: Observable<string[]>;
    fallback$: Observable<string[]>;
    higherOrder$: Observable<string[]>;
  } {
    let attempt = 0;
    const unstable$ = defer(() => {
      attempt += 1;
      if (attempt < 2) {
        return throwError(() => new Error('boom'));
      }
      return of('ok');
    });

    const retry$ = unstable$.pipe(
      retry(1),
      catchError(() => of('fallback')),
      toArray()
    );

    const fallback$ = throwError(() => new Error('fail')).pipe(
      catchError(() => of('fallback')),
      toArray()
    );

    const higherOrder$ = from([1, 2, 3]).pipe(
      mergeMap((value) =>
        this.unstableInner$(value).pipe(
          retry(1),
          catchError(() => of(`recover:${value}`))
        )
      ),
      toArray()
    );

    return { retry$, fallback$, higherOrder$ };
  }

  subscriptionDemo$(): Observable<string> {
    return interval(250).pipe(map((tick) => `tick:${tick}`));
  }

  cleanupStrategies$(): Observable<string[]> {
    const takeOne$ = interval(100).pipe(
      take(1),
      map((value) => `take(1):${value}`)
    );
    const first$ = from([0, 1, 2]).pipe(
      first((value) => value > 0),
      map((value) => `first:${value}`)
    );
    const finalize$ = of('finalize:done').pipe(
      finalize(() => undefined),
      map((value) => value)
    );

    return concat(takeOne$, first$, finalize$).pipe(toArray());
  }

  private unstableInner$(value: number): Observable<string> {
    if (value === 2) {
      return throwError(() => new Error('transient'));
    }
    return of(`ok:${value}`).pipe(delay(100));
  }

  createObserver(): Observer<string> {
    return {
      next: () => undefined,
      error: () => undefined,
      complete: () => undefined,
    };
  }

  getSimulationPreview(
    key: OperatorSimulationKey,
    condition = true,
    overrides?: OperatorSimulationOverrides
  ): OperatorSimulationPreview {
    if (key === 'filter') {
      const mode = overrides?.filterMode ?? 'even';
      const threshold = Number.isFinite(overrides?.filterThreshold as number) ? (overrides?.filterThreshold as number) : 3;
      const filterLabel =
        mode === 'odd'
          ? 'valeurs impaires'
          : mode === 'gte'
            ? `valeurs >= ${threshold}`
            : 'valeurs paires';
      return {
        label: 'filter',
        description:
          `Filtre ${filterLabel} du flux. Etape 1 : chaque emission entre dans le filtre. Etape 2 : seules les valeurs qui matchent le critere passent. Etape 3 : les autres sont ignorees.`,
        source: overrides?.source ?? this._numericSource,
      };
    }
    if (key === 'iif') {
      const cacheValue = overrides?.iifCacheValue ?? 'iif:cache';
      const apiValue = overrides?.iifApiValue ?? 'iif:api';
      const apiDelay = Number.isFinite(overrides?.iifDelay as number) ? (overrides?.iifDelay as number) : 200;
      return {
        label: 'iif',
        description: condition
          ? `Condition vraie : branche "cache". Etape 1 : evaluation de la condition. Etape 2 : selection de la branche cache. Etape 3 : emission immediate (${cacheValue}).`
          : `Condition fausse : branche "api". Etape 1 : evaluation de la condition. Etape 2 : selection de la branche api. Etape 3 : emission apres delai (${apiDelay}ms, valeur ${apiValue}).`,
        source: [{ value: condition ? 'true' : 'false', delay: 0 }],
      };
    }
    if (key === 'takeWhile') {
      const threshold = Number.isFinite(overrides?.filterThreshold as number) ? (overrides?.filterThreshold as number) : 3;
      return {
        label: 'takeWhile',
        description:
          `Emet tant que la condition est vraie (valeur < ${threshold}). Au premier faux, le flux se termine.`,
        source: overrides?.source ?? this._numericSource,
      };
    }
    if (key === 'defaultIfEmpty') {
      return {
        label: 'defaultIfEmpty',
        description:
          'Si la source ne produit rien, une valeur par defaut est emise.',
        source: overrides?.source ?? [],
      };
    }
    if (key === 'map') {
      return {
        label: 'map',
        description:
          'Transforme chaque emission via une fonction de projection.',
        source: overrides?.source ?? this._numericSource,
      };
    }
    if (key === 'scan' || key === 'reduce') {
      const label = key === 'scan' ? 'scan' : 'reduce';
      const description =
        key === 'scan'
          ? 'Agrégation progressive : a chaque emission, on calcule un cumul. Chaque etape produit une sortie.'
          : 'Agrégation finale : toutes les valeurs sont accumulees, la sortie arrive a la fin du flux.';
      return {
        label,
        description,
        source: overrides?.source ?? this._numericSource,
      };
    }
    const base =
      'Chaque emission declenche une operation asynchrone avec latence variable.';
    const detail =
      key === 'switchMap'
        ? ' Etape 1 : une nouvelle emission arrive. Etape 2 : on annule la precedente operation en cours. Etape 3 : seule la derniere emission produit une sortie.'
        : key === 'mergeMap'
          ? ' Etape 1 : chaque emission lance une operation. Etape 2 : toutes les operations tournent en parallele. Etape 3 : les sorties arrivent dans l ordre des fins.'
          : key === 'concatMap'
            ? ' Etape 1 : chaque emission est mise en file. Etape 2 : on attend la fin de l operation courante. Etape 3 : les sorties respectent l ordre d entree.'
            : ' Etape 1 : la premiere emission lance une operation. Etape 2 : tant que cette operation n est pas finie, les emissions suivantes sont ignorees. Etape 3 : la prochaine emission acceptee demarre apres completion.';

    return {
      label: key,
      description: `${base}${detail}`,
      source: overrides?.source ?? this._higherOrderSource,
      inner: overrides?.inner ?? this._higherOrderInner,
    };
  }

  simulateOperator$(
    key: OperatorSimulationKey,
    options?: { condition?: boolean } & OperatorSimulationOverrides
  ): Observable<OperatorSimulationEvent> {
    const start = Date.now();
    const stamp = (lane: OperatorSimulationEvent['lane'], value: string | number): OperatorSimulationEvent => ({
      t: Date.now() - start,
      lane,
      value: String(value),
    });

    if (key === 'iif') {
      const condition = options?.condition ?? true;
      const cacheValue = options?.iifCacheValue ?? 'iif:cache';
      const apiValue = options?.iifApiValue ?? 'iif:api';
      const apiDelay = Number.isFinite(options?.iifDelay as number) ? (options?.iifDelay as number) : 200;
      const sourceLog$ = of(stamp('source', `condition:${condition}`));
      const output$ = iif(
        () => condition,
        of(cacheValue),
        of(apiValue).pipe(delay(apiDelay))
      );
      const outputLog$ = output$.pipe(
        materialize(),
        map((notification) => {
          if (notification.kind === 'N') {
            return stamp('output', notification.value ?? '');
          }
          if (notification.kind === 'E') {
            return stamp('info', `error:${notification.error?.message ?? notification.error}`);
          }
          return stamp('info', 'complete');
        })
      );
      return merge(sourceLog$, outputLog$);
    }

    const scenario = this.getSimulationPreview(key, options?.condition ?? true, options);
    const source$ = from(scenario.source).pipe(
      concatMap((item) => timer(item.delay).pipe(map(() => item.value))),
      share()
    );
    const output$ = this.applySimulationOperator(
      key,
      source$,
      scenario.inner ?? [],
      options
    );
    const outputNotifications$ = output$.pipe(materialize(), share());
    const outputDone$ = outputNotifications$.pipe(
      filter((notification) => notification.kind !== 'N'),
      take(1)
    );
    const sourceLog$ = source$.pipe(
      map((value) => stamp('source', value)),
      takeUntil(outputDone$)
    );
    const outputLog$ = outputNotifications$.pipe(
      map((notification) => {
        if (notification.kind === 'N') {
          return stamp('output', notification.value ?? '');
        }
        if (notification.kind === 'E') {
          return stamp('info', `error:${notification.error?.message ?? notification.error}`);
        }
        return stamp('info', 'complete');
      })
    );

    return merge(sourceLog$, outputLog$);
  }

  simulateHotCold$(
    mode: HotColdSimulationMode,
    options?: {
      source?: Array<{ value: string | number; delay: number }>;
      subBDelay?: number;
    }
  ): Observable<HotColdSimulationEvent> {
    const start = Date.now();
    const stamp = (lane: HotColdSimulationEvent['lane'], value: string | number): HotColdSimulationEvent => ({
      t: Date.now() - start,
      lane,
      value: String(value),
    });

    const source = options?.source ?? this._higherOrderSource;
    const subBDelay = Number.isFinite(options?.subBDelay as number) ? (options?.subBDelay as number) : 300;

    const base$ = from(source).pipe(
      concatMap((item) => timer(item.delay).pipe(map(() => item.value)))
    );

    const shared$ =
      mode === 'hot'
        ? base$.pipe(share())
        : mode === 'shareReplay'
          ? base$.pipe(shareReplay({ bufferSize: 1, refCount: true }))
          : base$;

    const logStream = (lane: HotColdSimulationEvent['lane'], stream$: Observable<string | number>) =>
      stream$.pipe(
        materialize(),
        map((notification) => {
          if (notification.kind === 'N') {
            return stamp(lane, notification.value ?? '');
          }
          if (notification.kind === 'E') {
            return stamp('info', `${lane}:error:${notification.error?.message ?? notification.error}`);
          }
          return stamp('info', `${lane}:complete`);
        })
      );

    const subA$ = logStream('subA', shared$);
    const subBStart$ = timer(subBDelay).pipe(map(() => stamp('info', 'subB:subscribe')));
    const subB$ = timer(subBDelay).pipe(
      switchMap(() => logStream('subB', shared$))
    );

    return merge(subA$, subBStart$, subB$);
  }

  simulateCombination$(
    key: CombinationSimulationKey,
    options?: {
      sourceA?: Array<{ value: string | number; delay: number }>;
      sourceB?: Array<{ value: string | number; delay: number }>;
    }
  ): Observable<OperatorSimulationEvent> {
    const start = Date.now();
    const stamp = (lane: OperatorSimulationEvent['lane'], value: string | number): OperatorSimulationEvent => ({
      t: Date.now() - start,
      lane,
      value: String(value),
    });

    const sourceA = options?.sourceA ?? this._higherOrderSource;
    const sourceB = options?.sourceB ?? [
      { value: 'X', delay: 0 },
      { value: 'Y', delay: 150 },
      { value: 'Z', delay: 150 },
    ];

    const sourceA$ = from(sourceA).pipe(
      concatMap((item) => timer(item.delay).pipe(map(() => item.value))),
      share()
    );
    const sourceB$ = from(sourceB).pipe(
      concatMap((item) => timer(item.delay).pipe(map(() => item.value))),
      share()
    );

    const sourceALog$ = sourceA$.pipe(map((value) => stamp('source', `A:${value}`)));
    const sourceBLog$ = sourceB$.pipe(map((value) => stamp('source', `B:${value}`)));

    let output$: Observable<string>;
    if (key === 'combineLatest') {
      output$ = combineLatest([sourceA$, sourceB$]).pipe(
        map(([a, b]) => `A:${a} | B:${b}`)
      );
    } else if (key === 'merge') {
      output$ = merge(
        sourceA$.pipe(map((value) => `A:${value}`)),
        sourceB$.pipe(map((value) => `B:${value}`))
      );
    } else if (key === 'zip') {
      output$ = zip(sourceA$, sourceB$).pipe(
        map(([a, b]) => `A:${a} | B:${b}`)
      );
    } else {
      const numeric$ = sourceA$.pipe(filter((value): value is number => typeof value === 'number'));
      const [even$, odd$] = partition(numeric$, (value) => value % 2 === 0);
      output$ = merge(
        even$.pipe(map((value) => `even:${value}`)),
        odd$.pipe(map((value) => `odd:${value}`))
      );
    }

    const outputLog$ = output$.pipe(
      materialize(),
      map((notification) => {
        if (notification.kind === 'N') {
          return stamp('output', notification.value ?? '');
        }
        if (notification.kind === 'E') {
          return stamp('info', `error:${notification.error?.message ?? notification.error}`);
        }
        return stamp('info', 'complete');
      })
    );

    if (key === 'partition') {
      return merge(sourceALog$, outputLog$);
    }

    return merge(sourceALog$, sourceBLog$, outputLog$);
  }

  private applySimulationOperator(
    key: OperatorSimulationKey,
    source$: Observable<string | number>,
    inner: Array<{ value: string | number; delay: number }>,
    options?: OperatorSimulationOverrides
  ): Observable<string> {
    if (key === 'filter') {
      const mode = options?.filterMode ?? 'even';
      const threshold = Number.isFinite(options?.filterThreshold as number) ? (options?.filterThreshold as number) : 3;
      return source$.pipe(
        filter((value): value is number => typeof value === 'number'),
        filter((value) => {
          if (mode === 'odd') {
            return value % 2 !== 0;
          }
          if (mode === 'gte') {
            return value >= threshold;
          }
          return value % 2 === 0;
        }),
        map((value) => `pass:${value}`)
      );
    }
    if (key === 'takeWhile') {
      const threshold = Number.isFinite(options?.filterThreshold as number) ? (options?.filterThreshold as number) : 3;
      return source$.pipe(
        filter((value): value is number => typeof value === 'number'),
        takeWhile((value) => value < threshold),
        map((value) => `pass:${value}`)
      );
    }
    if (key === 'defaultIfEmpty') {
      return source$.pipe(
        map((value) => `value:${value}`),
        defaultIfEmpty('default:empty')
      );
    }
    if (key === 'map') {
      return source$.pipe(
        filter((value): value is number => typeof value === 'number'),
        map((value) => value * 10),
        map((value) => `map:${value}`)
      );
    }
    if (key === 'scan' || key === 'reduce') {
      const aggregate$ = source$.pipe(
        filter((value): value is number => typeof value === 'number'),
        key === 'scan'
          ? scan((acc, value) => acc + value, 0)
          : reduce((acc, value) => acc + value, 0)
      );
      return aggregate$.pipe(
        map((value) => (key === 'scan' ? `scan:${value}` : `reduce:${value}`))
      );
    }

    const innerDelay = (value: string | number) => {
      const found = inner.find((item) => String(item.value) === String(value));
      return found ? found.delay : 150;
    };
    const makeInner = (value: string | number) =>
      of(`result:${value}`).pipe(delay(innerDelay(value)));

    switch (key) {
      case 'mergeMap':
        return source$.pipe(mergeMap(makeInner));
      case 'concatMap':
        return source$.pipe(concatMap(makeInner));
      case 'exhaustMap':
        return source$.pipe(exhaustMap(makeInner));
      case 'switchMap':
      default:
        return source$.pipe(switchMap(makeInner));
    }
  }
}
