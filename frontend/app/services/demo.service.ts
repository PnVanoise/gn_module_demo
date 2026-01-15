import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@geonature/services/config.service';
import { Demo } from '../models/demo';
import { ModuleService } from '@geonature/services/module.service';

@Injectable()
export class DemoService {
  constructor(
    private _http: HttpClient,
    private _config: ConfigService,
    private _moduleService: ModuleService
  ) {}
  getDemos(): Observable<Demo[]> {
    return this._http.get<Demo[]>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/`,
    );
  }
  getDemo(id_demo: number): Observable<Demo> {
    return this._http.get<Demo>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/${id_demo}`
    );
  }
}
