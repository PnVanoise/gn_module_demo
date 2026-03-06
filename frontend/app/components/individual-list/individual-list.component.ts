import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { RouterModule } from '@angular/router';
import { BehaviorSubject,Observable } from 'rxjs';
import { switchMap, tap, shareReplay } from 'rxjs/operators';
import { Individual } from '../../models/individual';
import { PaginatedResponse } from '../../models/pagination';
import { IndividualComponent } from '../individual/individual.component';
import { IndividualService } from '../../services/individual.service';

@Component({
  standalone: true,
  templateUrl: 'individual-list.component.html',
  styleUrls: ['./individual-list.component.scss'],
  imports: [
    GN2CommonModule,
    CommonModule,
    RouterModule,
    IndividualComponent
  ],
})
export class IndividualListComponent implements OnInit {
  // individuals: Individual[] = [];
  paginatedIndividuals: PaginatedResponse<Individual>;
  // private _listPaginationSnapshot: PaginatedResponse<Individual> | null = null;
  //individuals$: Observable<PaginatedResponse<Individual>>;
  individuals$: PaginatedResponse<Individual>;

  params= {
    offset: 1,
    limit: 5
  }
  // private _pagination$ = new BehaviorSubject<{ page: number; limit: number }>({
  //   page: 1,
  //   limit: 5,
  // });
  columns = [
    { prop: 'name', name: 'Individu' },
    { prop: 'taxref.nom_vern', name: 'Taxon' },
    { prop: 'nomenclature_sex.label_fr', name: 'Sexe' },
  ];

  constructor(
    private _individualService: IndividualService,
  ) {}

  ngOnInit() {
    console.log('Fetching individuals...');
    this.loadIndividuals();

  }

  onPage($event) {
    this.params.offset = ($event.offset ?? 0) + 1; // ngx-datatable offset est 0-based
    this.params.limit = $event.limit ?? this.params.limit;
    this.loadIndividuals(this.params.offset, this.params.limit);
    // console.log('Page event:', $event,'limit ',this._pagination$.getValue().limit);
    // const page = Number($event.offset ?? 0) + 1;
    // const limit = Number($event.limit ?? this._pagination$.getValue().limit);
    // this._pagination$.next({
    //   page: page > 0 ? page : 1,
    //   limit: this._pagination$.getValue().limit,
    // });
    // console.log('limit ',this._pagination$.getValue().limit);
  }

  // loadIndividuals(page = 1, limit = 5) {
  //   this.individuals$ = this._pagination$.pipe(
  //     switchMap(({ page, limit }) => this._individualService.getIndividuals(page, limit)),
  //     tap((pagination) => (this._listPaginationSnapshot = pagination)),
  //     shareReplay({ bufferSize: 1, refCount: true })
  //   );
  // }
  loadIndividuals(page = 1, limit = 5) {
    this._individualService.getIndividuals(page,limit).subscribe((response: PaginatedResponse<Individual>) => {
      this.paginatedIndividuals = response;
      console.log('Fetched individuals:', response);
    });
  }
}