from geonature.utils.env import db, ma
from pypn_habref_api import data
from utils_flask_sqla.schema import SmartRelationshipsMixin
from marshmallow import fields, post_dump, validates, ValidationError

from gn_module_demo.models import Individual

from apptax.taxonomie.schemas import TaxrefSchema
from apptax.taxonomie.models import Taxref


class IndividualSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Individual
        include_fk = True
        load_instance = True
        sqla_session = db.session

    taxref = ma.Nested(TaxrefSchema)
    additional_data = fields.Dict()
    cd_nom = ma.auto_field()


    # Sérialisation - Vérifications sur additional_data
    # On vérifie la présence de champs obligatoires dans additional_data
    # On vérifie que si un champ cd_nom est présent, il existe dans la table taxref
    # On vérifie le type et la valeur de birth_year
    @validates("additional_data")
    # create an instance method that takes a value for username
    def validates_additional_data(self, additional_data):
        ADDITIONAL_DATA_MANDATORY = [
                                        "birth_year", "sex", "surname"
                                    ]
        if additional_data is not None and not isinstance(additional_data, dict):
            raise ValidationError("additional_data must be a JSON object (dict).")
        
        if not all(field in additional_data.keys() for field in ADDITIONAL_DATA_MANDATORY):
            raise ValidationError(
                f"additional_data must contain at least the following fields: {ADDITIONAL_DATA_MANDATORY}."
            )

        # si un champ cd_nom est présent, il doit exister dans la table taxref
        cd_nom_payload = additional_data.get("cd_nom")
        if cd_nom_payload is not None:
            query = db.select(Taxref).filter_by(cd_nom=cd_nom_payload)
            res = db.session.execute(query).one_or_none()
            if res is None:
                raise ValidationError(f"cd_nom {cd_nom_payload} does not exist in taxref table.")

        # tests sur le type et la valeur de birth_year
        if not isinstance(additional_data["birth_year"], int):
            raise ValidationError("birth_year must be an integer")
        elif additional_data["birth_year"] < 1990:
            raise ValidationError("We're not dealing with turtles ! birth_year sould be after 1990.")
        
        return additional_data

    # Désérialisation - Si le dictionnaire additional_data est vide ou non défini,
    # on le remplit avec des valeurs par défaut
    @post_dump
    def ensure_additional(self, data, **kwargs):
        if data.get("additional_data") is None or data.get("additional_data") == {}:
            data["additional_data"] = {
                    "sex": "U",
                    "birth_year": None,
                    "surname": "à renseigner"
                }
        return data