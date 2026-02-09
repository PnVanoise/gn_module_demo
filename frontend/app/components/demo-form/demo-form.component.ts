import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';

import { DemoService } from '../../services/demo.service';
import { Individual } from '../../models/individual';
import { TaxrefLite } from '../../models/taxref';
import { CanLeaveForm } from '../../guards/demo-form.guard';

function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value);
    if (!Number.isInteger(value) || value <= 0) {
      return { positiveInteger: true };
    }
    return null;
  };
}

@Component({
  standalone: true,
  templateUrl: './demo-form.component.html',
  styleUrls: ['./demo-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, GN2CommonModule],
})
export class DemoFormComponent implements CanLeaveForm {
  saving = false;
  created: Individual | null = null;
  errorMessage: string | null = null;
  taxrefResults: TaxrefLite[] = [];
  taxrefLoading = false;

  form = this._fb.group({
    name_individual: ['', [Validators.required, Validators.maxLength(80)]],
    cd_nom: [null, [Validators.required, positiveIntegerValidator()]],
    notes: [''],
  });

  constructor(
    private _fb: FormBuilder,
    private _demoService: DemoService
  ) {}

  searchTaxref(term: string) {
    const trimmed = (term || '').trim();
    if (trimmed.length < 2) {
      this.taxrefResults = [];
      return;
    }
    this.taxrefLoading = true;
    this._demoService.searchTaxref(trimmed).subscribe({
      next: (results) => {
        this.taxrefResults = results;
        this.taxrefLoading = false;
      },
      error: () => {
        this.taxrefResults = [];
        this.taxrefLoading = false;
      },
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMessage = null;
    const payload = {
      name_individual: this.form.value.name_individual ?? '',
      cd_nom: this.form.value.cd_nom ? Number(this.form.value.cd_nom) : null,
      additional_data: {
        notes: this.form.value.notes ?? '',
      },
    };
    this._demoService.createIndividual(payload).subscribe({
      next: (created) => {
        this.created = created;
        this.form.markAsPristine();
        this.saving = false;
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Erreur lors de la creation.';
        this.saving = false;
      },
    });
  }

  isDirty(): boolean {
    return this.form.dirty && !this.saving;
  }
}
