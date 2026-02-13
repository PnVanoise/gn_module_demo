import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Individual } from '../../models/individual';
import { IndividualService } from '../../services/individual.service'; 
import { IndividualComponent } from '../individual/individual.component';

@Component({
  // selector: 'pnx-individual-list',
  standalone: true,
  templateUrl: 'individual-list.component.html',
  styleUrls: ['individual-list.component.scss'],
  imports: [CommonModule, IndividualComponent, RouterModule],
})

export class IndividualListComponent {
  indivs: Individual[] = [];

  constructor(
    private _individualService: IndividualService,
  ) {}

  ngOnInit() {
    this._individualService.getIndividuals().subscribe((response: Individual[]) => {
      this.indivs = response;
    });
  }
}