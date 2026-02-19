import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Individual } from '../../models/individual';
import { IndividualService } from '../../services/individual.service';

@Component({
  standalone: true,
  selector: 'pnx-individual-page',
  templateUrl: 'individual-page.component.html',
  styleUrls: ['./individual-page.component.scss'],
  imports: [CommonModule],
})
export class IndividualPageComponent implements OnInit {
  indiv: Individual | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _individualService: IndividualService,
  ) {}

  ngOnInit(): void {
    const idParam = this._route.snapshot.paramMap.get('id_individual');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      this._individualService.getIndividual(id).subscribe((response: Individual) => {
        this.indiv = response;
      });
    }
  }
}
