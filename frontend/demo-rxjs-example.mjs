#!/usr/bin/env node
import { interval, of } from 'rxjs';
import { take, map, switchMap, concatMap, delay, tap } from 'rxjs/operators';

const now = () => new Date().toISOString();

const sourceFactory = () => interval(300).pipe(take(3), map(i => i + 1));
function asyncOp(v) {
  const wait = 500 + v * 300;
  return of(v).pipe(
    delay(wait),
    tap(() => console.log(`${now()} inner complete ${v} (wait ${wait}ms)`))
  );
}

console.log(`${now()} start switchMap`);
const source1 = sourceFactory();
source1.pipe(
  switchMap((v) => {
    console.log(`${now()} switchMap source ${v}`);
    return asyncOp(v);
  })
).subscribe({
  next: (v) => console.log(`${now()} switchMap result ${v}`),
  complete: () => {
    console.log(`${now()} switchMap complete`);
    runConcat();
  }
});

function runConcat() {
  console.log(`${now()} start concatMap`);
  const source2 = sourceFactory();
  source2.pipe(
    concatMap((v) => {
      console.log(`${now()} concatMap source ${v}`);
      return asyncOp(v);
    })
  ).subscribe({
    next: (v) => console.log(`${now()} concatMap result ${v}`),
    complete: () => console.log(`${now()} concatMap complete`)
  });
}
