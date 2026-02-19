import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Individual } from '../../models/individual';
import { IndividualService } from '../../services/individual.service'; 
import { IndividualListItemComponent } from '../individual-list-item/individual-list-item.component';

@Component({
  // selector: 'pnx-individual-list',
  standalone: true,
  templateUrl: 'individual-list.component.html',
  styleUrls: ['individual-list.component.scss'],
  imports: [CommonModule, IndividualListItemComponent, RouterModule],
})

export class IndividualListComponent {
  indivs: Individual[] = [];
  loading = false;

  constructor(
    private _individualService: IndividualService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this._individualService.getIndividuals().subscribe({
      next: (response: Individual[]) => {
        this.indivs = response;
        this.loading = false;
      },
      error: () => {
        this.indivs = [];
        this.loading = false;
      }
    });
  }

  delete(id: number | null) {
    if (!id) return;
    if (!confirm('Confirmer la suppression de cet individu ?')) return;
    this._individualService.deleteIndividual(id).subscribe({
      next: () => this.load(),
      error: (err) => alert('Erreur suppression: ' + (err?.message || '')),
    });
  }
}