import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { Demo } from '../../models/demo';
import { DemoService } from '../../services/demo.service';
import { DemoStateService } from '../../services/demo-state.service';

@Component({
  standalone: true,
  templateUrl: './demo-state.component.html',
  styleUrls: ['./demo-state.component.scss'],
  imports: [CommonModule],
})
export class DemoStateComponent {
  demos$: Observable<Demo[]> = this._demoService.getDemos();
  selectedDemo$ = this._demoState.selectedDemo$;

  constructor(
    private _demoService: DemoService,
    private _demoState: DemoStateService
  ) {}

  selectDemo(demo: Demo) {
    this._demoState.selectDemo(demo.id_demo);
  }

  clearSelection() {
    this._demoState.clearSelection();
  }
}
