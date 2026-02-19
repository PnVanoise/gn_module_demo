import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of, timer } from 'rxjs';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

//import NomenclatureComponent from '@geonature/components/nomenclature/nomenclature.component';
import { IndividualService } from '../../services/individual.service';
import { Individual } from '../../models/individual';
// import { TaxrefLite } from '../../models/taxref';
// import { CanLeaveForm } from '../../guards/demo-form.guard';

function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value);
    if (!Number.isInteger(value) || value <= 0) {
      return { positiveInteger: true };
    }
    return null;
  };
}

const ADDITIONAL_DATA_ALLOWED_SEX = ['M', 'F', 'U'];

function additionalDataSyncValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? {}) as {
      age?: unknown;
      sex?: unknown;
      notes?: unknown;
    };
    const age = value.age;
    const sexRaw = value.sex;
    const sex = typeof sexRaw === 'string' ? sexRaw.trim() : sexRaw;
    const notes = typeof value.notes === 'string' ? value.notes.trim() : value.notes;
    const hasAge = age !== null && age !== undefined && age !== '';
    const hasSex = sex !== null && sex !== undefined && sex !== '';
    const hasNotes = notes !== null && notes !== undefined && notes !== '';

    if (!hasAge && !hasSex && !hasNotes) {
      return null;
    }
    const errors: string[] = [];
    if (!hasAge || !hasSex) {
      errors.push('Les champs age et sex sont obligatoires ensemble.');
    }
    if (hasAge) {
      const parsedAge = Number(age);
      if (!Number.isInteger(parsedAge)) {
        errors.push("L'age doit etre un entier.");
      } else if (parsedAge < 0) {
        errors.push("L'age doit etre superieur ou egal a 0.");
      }
    }
    if (hasSex) {
      if (typeof sex !== 'string') {
        errors.push('Le champ sex doit etre une chaine.');
      } else if (!ADDITIONAL_DATA_ALLOWED_SEX.includes(sex)) {
        errors.push(`Sex doit etre parmi: ${ADDITIONAL_DATA_ALLOWED_SEX.join(', ')}.`);
      }
    }

    return errors.length ? { additionalData: errors } : null;
  };
}

// function additionalDataAsyncValidator(individualService: IndividualService): AsyncValidatorFn {
//   return (control: AbstractControl) => {
//     const value = (control.value ?? {}) as {
//       age?: unknown;
//       sex?: unknown;
//       notes?: unknown;
//     };
//     const age = value.age;
//     const sex = typeof value.sex === 'string' ? value.sex.trim() : value.sex;
//     const notes = typeof value.notes === 'string' ? value.notes.trim() : value.notes;
//     const hasAge = age !== null && age !== undefined && age !== '';
//     const hasSex = sex !== null && sex !== undefined && sex !== '';
//     const hasNotes = notes !== null && notes !== undefined && notes !== '';

//     if (!hasAge && !hasSex && !hasNotes) {
//       return of(null);
//     }
//     return timer(300).pipe(
//       switchMap(() =>
//         individualService.validateIndividual({
//           additional_data: value,
//         })
//       ),
//       map(() => null),
//       catchError((err) => {
//         const messages = err?.error?.errors?.additional_data;
//         if (Array.isArray(messages) && messages.length) {
//           return of({ additionalData: messages });
//         }
//         if (typeof messages === 'string') {
//           return of({ additionalData: [messages] });
//         }
//         return of({ additionalData: ['Validation serveur: donnees additionnelles invalides.'] });
//       })
//     );
//   };
// }

@Component({
  standalone: true,
  templateUrl: './individual-add.component.html',
  styleUrls: ['./individual-add.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, GN2CommonModule, RouterModule],
})
// export class IndividualAddComponent implements CanLeaveForm {
export class IndividualAddComponent {
  saving = false;
  created: Individual | null = null;
  errorMessage: string | null = null;
  taxrefLoading = false;

  form = this._fb.group({
    individual_name: ['', [Validators.required, Validators.maxLength(80)]],
    cd_nom: [null, [Validators.required, positiveIntegerValidator()]],
    cd_nom_temp: [null],
    birth_year: [null, [Validators.required, positiveIntegerValidator()]],
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
    // copy numeric id from the selected taxon into cd_nom so validators pass
    if (e && e.item && e.item.cd_nom != null) {
      this.form.patchValue({ cd_nom: e.item.cd_nom });
    }
  }

  searchTaxref(term: string) {
    const trimmed = (term || '').trim();
    if (trimmed.length < 2) {
      // this.taxrefResults = [];
      return;
    }
    this.taxrefLoading = true;
    // this._individualService.searchTaxref(trimmed).subscribe({
    //   next: (results) => {
    //     this.taxrefResults = results;
    //     this.taxrefLoading = false;
    //   },
    //   error: () => {
    //     this.taxrefResults = [];
    //     this.taxrefLoading = false;
    //   },
    //   complete: () => {
    //     this.taxrefLoading = false;
    //   },
    // });
  }

  submit() {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMessage = null;
    // const additionalData = this.form.value.additional_data ?? {};
    // const age = additionalData.age;
    // const sex = typeof additionalData.sex === 'string' ? additionalData.sex.trim() : additionalData.sex;
    // const notes =
      // typeof additionalData.notes === 'string' ? additionalData.notes.trim() : additionalData.notes;
    // const hasAge = age !== null && age !== undefined && age !== '';
    // const hasSex = sex !== null && sex !== undefined && sex !== '';
    // const hasNotes = notes !== null && notes !== undefined && notes !== '';
    // const payloadAdditionalData =
    //   hasAge && hasSex
    //     ? {
    //         age: Number(age),
    //         sex,
    //         ...(hasNotes ? { notes } : {}),
    //       }
    //     : undefined;
    const payload = {
      individual_name: this.form.value.individual_name ?? '',
      cd_nom: this.form.value.cd_nom ? Number(this.form.value.cd_nom) : null,
      additional_data: {
        birth_year: this.form.value.birth_year
          ? Number(this.form.value.birth_year)
          : null,
        sex: this.form.value.sex
          ? String(this.form.value.sex)
          : null,
        surname: this.form.value.surname ?? null, 
      },
    };
    console.log("msg payload to submit", payload);
    this._individualService.createIndividual(payload).subscribe({
      next: (created) => {
        this.created = created;
        this.form.markAsPristine();
        this.saving = false;
        // navigate back to the list view after successful creation
        try {
          this._router.navigate(['..'], { relativeTo: this._route });
        } catch (e) {
          // fallback to absolute path
          this._router.navigate(['/demo/ind']);
        }
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
