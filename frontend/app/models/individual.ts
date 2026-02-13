export interface Taxref {
  classe: string;
  famille: string;
  nom_vern: string;
  ordre: string;
}

export interface Individual {
  id_individual: number;
  label: string;
  taxref: Taxref;
}
