import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable()
export class DemoIdGuard implements CanActivate {
  constructor(private _router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rawId = route.paramMap.get('id_demo');
    const id = rawId ? Number(rawId) : NaN;
    if (Number.isNaN(id) || id <= 0) {
      this._router.navigate(['/']);
      return false;
    }
    return true;
  }
}
