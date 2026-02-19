export interface Taxref {
  classe: string;
  famille: string;
  nom_vern: string;
  ordre: string;
}

export interface Individual {
  id_individual: number;
  taxref: Taxref;
  individual_name: string;
  cd_nom: number;
  additional_data: AdditionalData;
}

export interface AdditionalData {
  birth_year?: number;
  sex?: string;
  surname?: string;
  [key: string]: any;
}
