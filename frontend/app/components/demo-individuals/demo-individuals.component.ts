import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import { Individual } from '../../models/individual';
import { PaginatedResponse } from '../../models/pagination';
import { DemoService } from '../../services/demo.service';

@Component({
  standalone: true,
  templateUrl: './demo-individuals.component.html',
  styleUrls: ['./demo-individuals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class DemoIndividualsComponent implements OnInit {
  individuals$!: Observable<PaginatedResponse<Individual>>;
  private _pagination$ = new BehaviorSubject<{ page: number; limit: number }>({
    page: 1,
    limit: 10,
  });

  constructor(private _demoService: DemoService) {}

  ngOnInit() {
    this.individuals$ = this._pagination$.pipe(
      switchMap(({ page, limit }) => this._demoService.getIndividuals(page, limit)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  nextPage(payload: PaginatedResponse<Individual>) {
    if (!payload.next_num) {
      return;
    }
    this._pagination$.next({ page: payload.next_num, limit: payload.per_page });
  }

  prevPage(payload: PaginatedResponse<Individual>) {
    if (!payload.prev_num) {
      return;
    }
    this._pagination$.next({ page: payload.prev_num, limit: payload.per_page });
  }

  trackByIndividualId(index: number, item: Individual) {
    return item.id_individual;
  }
}
