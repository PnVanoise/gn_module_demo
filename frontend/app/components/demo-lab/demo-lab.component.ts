import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  templateUrl: './demo-lab.component.html',
  styleUrls: ['./demo-lab.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class DemoLabComponent {}
