import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, startWith, switchMap } from 'rxjs/operators';

import { DemoService } from '../../services/demo.service';
import { TaxrefLite } from '../../models/taxref';

@Component({
  standalone: true,
  templateUrl: './demo-rxjs.component.html',
  styleUrls: ['./demo-rxjs.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DemoRxjsComponent {
  searchControl = new FormControl('');

  results$: Observable<TaxrefLite[]> = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter((value) => typeof value === 'string'),
    switchMap((query) => {
      const trimmed = (query || '').trim();
      if (trimmed.length < 2) {
        return of([]);
      }
      return this._demoService.searchTaxref(trimmed).pipe(catchError(() => of([])));
    }),
    startWith([])
  );

  constructor(private _demoService: DemoService) {}
}
