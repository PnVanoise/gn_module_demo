import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { IndividualService } from '../../services/individual.service';
import { Individual } from '../../models/individual';

@Component({
  standalone: true,
  templateUrl: './individual-form.component.html',
  styleUrls: ['./individual-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, GN2CommonModule],
})
export class IndividualFormComponent implements OnInit {
  saving = false;
  createdOrUpdated: Individual | null = null;
  errorMessage: string | null = null;
  editingId: number | null = null;

  form = this._fb.group({
    individual_name: ['', [Validators.required, Validators.maxLength(80)]],
    cd_nom: [null as number | null, [Validators.required]],
    cd_nom_temp: [null],
    birth_year: [null as number | null, [Validators.required]],
    sex: ['', [Validators.required]],
    surname: ['', [Validators.required, Validators.maxLength(80)]],
  });

  constructor(
    private _fb: FormBuilder,
    private _individualService: IndividualService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {}

  taxonSelected(e: any) {
    if (e && e.item && e.item.cd_nom != null) {
      this.form.patchValue({ cd_nom: e.item.cd_nom });
    }
  }

  ngOnInit(): void {
    const idParam = this._route.snapshot.paramMap.get('id_individual');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      this.editingId = id;
      this._individualService.getIndividual(id).subscribe((ind) => {
        this.form.patchValue({
          individual_name: ind.individual_name,
          cd_nom: ind.cd_nom,
          birth_year: ind.additional_data?.birth_year ?? null,
          sex: ind.additional_data?.sex ?? '',
          surname: ind.additional_data?.surname ?? '',
        });
      });
    }
  }

  submit() {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMessage = null;
    const payload: Partial<Individual> = {
      individual_name: this.form.value.individual_name ?? '',
      cd_nom: this.form.value.cd_nom ? Number(this.form.value.cd_nom) : null,
      additional_data: {
        birth_year: this.form.value.birth_year ? Number(this.form.value.birth_year) : null,
        sex: this.form.value.sex ? String(this.form.value.sex) : null,
        surname: this.form.value.surname ?? null,
      },
    };

    if (this.editingId) {
      this._individualService.updateIndividual(this.editingId, payload).subscribe({
        next: (updated) => {
          this.createdOrUpdated = updated;
          this.saving = false;
          this.form.markAsPristine();
          this._router.navigate(['../'], { relativeTo: this._route });
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Erreur lors de la mise à jour.';
          this.saving = false;
        },
      });
    } else {
      this._individualService.createIndividual(payload).subscribe({
        next: (created) => {
          this.createdOrUpdated = created;
          this.saving = false;
          this.form.markAsPristine();
          this._router.navigate(['../'], { relativeTo: this._route });
        },
        error: (err) => {
          this.errorMessage = err?.message || 'Erreur lors de la creation.';
          this.saving = false;
        },
      });
    }
  }

  cancel() {
    // navigate explicitly to the individuals list
    this._router.navigate(['/ind']).catch(() => undefined);
  }

}
