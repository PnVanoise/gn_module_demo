import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { GN2CommonModule } from '@geonature_common/GN2Common.module';

@Component({
  standalone: true,
  templateUrl: './demo-tabs.component.html',
  styleUrls: ['./demo-tabs.component.scss'],
  imports: [CommonModule, RouterModule, GN2CommonModule],
})
export class DemoTabsComponent {
  readonly tabs = [
    { label: 'Demos', route: 'list' },
    { label: 'Lab', route: 'lab' },
    { label: 'Individus', route: 'individuals' },
  ];
}
