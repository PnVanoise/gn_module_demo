import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Demo } from '../models/demo';
import { DemoService } from '../services/demo.service';

@Injectable()
export class DemoResolver implements Resolve<Demo | null> {
  constructor(private _demoService: DemoService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Demo | null> {
    const rawId = route.paramMap.get('id_demo');
    const id = rawId ? Number(rawId) : NaN;
    if (Number.isNaN(id) || id <= 0) {
      return of(null);
    }
    return this._demoService.getDemo(id).pipe(catchError(() => of(null)));
  }
}
