import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';

import { Demo } from '../models/demo';
import { DemoService } from './demo.service';

@Injectable()
export class DemoStateService {
  private _selectedDemoId = new BehaviorSubject<number | null>(null);

  readonly selectedDemoId$ = this._selectedDemoId.asObservable();
  readonly selectedDemo$: Observable<Demo | null> = this.selectedDemoId$.pipe(
    switchMap((id) => {
      if (id === null) {
        return of(null);
      }
      return this._demoService.getDemo(id).pipe(catchError(() => of(null)));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private _demoService: DemoService) {}

  selectDemo(id: number | null) {
    this._selectedDemoId.next(id);
  }

  clearSelection() {
    this._selectedDemoId.next(null);
  }
}
