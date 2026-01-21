import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

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
export class DemoPageComponent implements OnInit {
  demo: Demo | null = null;
  routeIdSnapshot: number | null = null;
  routeIdParams$!: Observable<number | null>;
  demo$!: Observable<Demo | null>;
  statusSteps = ['route snapshot', 'route params$', 'backend demo$'];

  constructor(
    private _demoService: DemoService,
    private _route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.routeIdSnapshot = this.parseId(this._route.snapshot.paramMap.get('id_demo'));
    this.routeIdParams$ = this._route.paramMap.pipe(
      map((params) => this.parseId(params.get('id_demo'))),
      distinctUntilChanged()
    );
    this.demo$ = this.routeIdParams$.pipe(
      switchMap((id) => {
        if (id === null) {
          return of(null);
        }
        return this._demoService.getDemo(id).pipe(
          catchError(() => of(null))
        );
      }),
      tap((demo) => {
        this.demo = demo;
      }),
      startWith(null),
      shareReplay(1)
    );
  }

  private parseId(rawId: string | null): number | null {
    if (rawId === null) {
      return null;
    }
    const parsed = Number(rawId);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
