import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { Demo } from '../../models/demo';

@Component({
  standalone: true,
  templateUrl: './demo-resolved.component.html',
  styleUrls: ['./demo-resolved.component.scss'],
  imports: [CommonModule],
})
export class DemoResolvedComponent {
  demo$ = this._route.data.pipe(map((data) => data['demo'] as Demo | null));

  constructor(private _route: ActivatedRoute) {}
}
