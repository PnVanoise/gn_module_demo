import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { GN2CommonModule } from '@geonature_common/GN2Common.module';

import { Individual } from '../../models/individual';
import { IndividualService } from '../../services/individual.service'; 

import { DemoListComponent } from '../demo-list/demo-list.component';

@Component({
  standalone: true,
  selector: 'pnx-individual',
  templateUrl: 'individual.component.html',
  styleUrls: ['./individual.component.scss'],
  imports: [
    GN2CommonModule,
    CommonModule,
    DemoListComponent
  ],
})
export class IndividualComponent implements OnInit {
  @Input()
  indiv: Individual | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _individualService: IndividualService,
  ) {}

  ngOnInit(): void {
    // If component is used as a routed page, load the individual from route param
    if (!this.indiv) {
      const idParam = this._route.snapshot.paramMap.get('id_individual');
      const id = idParam ? Number(idParam) : null;
      if (id) {
        this._individualService.getIndividual(id).subscribe((response: Individual) => {
          this.indiv = response;
        });
      }
    }
  }
}

