import { TaxrefLite } from './taxref';

export interface Individual {
  id_individual: number;
  name_individual: string;
  cd_nom: number | null;
  taxref?: TaxrefLite | null;
}

export interface IndividualPayload {
  name_individual: string;
  cd_nom: number | null;
  additional_data?: Record<string, unknown>;
}
