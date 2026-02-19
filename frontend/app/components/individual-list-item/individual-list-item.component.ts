import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';

import { Individual } from '../../models/individual';

@Component({
  standalone: true,
  selector: 'pnx-individual-list-item',
  templateUrl: 'individual-list-item.component.html',
  styleUrls: ['./individual-list-item.component.scss'],
  imports: [GN2CommonModule, CommonModule],
})
export class IndividualListItemComponent {
  @Input()
  indiv: Individual | null = null;
}
