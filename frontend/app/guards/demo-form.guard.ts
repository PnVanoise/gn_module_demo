import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export interface CanLeaveForm {
  isDirty(): boolean;
}

@Injectable()
export class DemoFormGuard implements CanDeactivate<CanLeaveForm> {
  canDeactivate(component: CanLeaveForm): boolean {
    if (!component.isDirty()) {
      return true;
    }
    return window.confirm('Le formulaire contient des modifications non enregistrées. Quitter ?');
  }
}
