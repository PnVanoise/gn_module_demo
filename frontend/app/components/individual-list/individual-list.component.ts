import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { RouterModule } from '@angular/router';

import { Individual } from '../../models/individual';
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
  individuals: Individual[] = [];

  constructor(
    private _individualService: IndividualService,
  ) {}

  ngOnInit() {
    console.log('Fetching individuals...');
    this._individualService.getIndividuals().subscribe((response: Individual[]) => {
      this.individuals = response;
    });
  }
}
