export interface Individual {
  id_individual: number
  name: string
  id_nomenclature_sex: number
  cd_nom: number
  geom_local: GeoJSON.Geometry
  //additional_data: JSON
}