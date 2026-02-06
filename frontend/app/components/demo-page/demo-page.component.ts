import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';

import { Demo } from '../../models/demo';
import { DemoComponent } from '../demo/demo.component';
import { DemoService } from '../../services/demo.service';

@Component({
  standalone: true,
  templateUrl: 'demo-page.component.html',
  styleUrls: ['./demo-page.component.scss'],
  imports: [
    GN2CommonModule,
    CommonModule,
    DemoComponent
  ],
})
export class DemoPageComponent implements OnInit, OnDestroy {
  demo: Demo | null = null;
  private _destroy$ = new Subject<void>();

  constructor(
    private _demoService: DemoService,
    private _route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this._route.paramMap.pipe(
      map((params) => this.parseId(params.get('id_demo'))),
      distinctUntilChanged(),
      switchMap((id) => {
        if (id === null) {
          return of(null);
        }
        return this._demoService.getDemo(id).pipe(
          catchError(() => of(null))
        );
      }),
      takeUntil(this._destroy$)
    ).subscribe((demo) => {
      this.demo = demo;
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private parseId(rawId: string | null): number | null {
    if (rawId === null) {
      return null;
    }
    const parsed = Number(rawId);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
