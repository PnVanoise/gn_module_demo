"""
Schemas de serialisation pour le module demo.
"""

from marshmallow import Schema, ValidationError, fields, validates

from apptax.taxonomie.models import Taxref
from apptax.taxonomie.schemas import TaxrefSchema
from geonature.utils.env import db, ma

from .models import Individuals


class DemoSchema(Schema):
    id_demo = fields.Integer(required=True)


demo_schema = DemoSchema()
demo_list_schema = DemoSchema(many=True)


class TaxrefAutocompleteSchema(Schema):
    cd_nom = fields.Integer(required=True)
    nom_complet = fields.String(required=True)


taxref_autocomplete_schema = TaxrefAutocompleteSchema(many=True)
ADDITIONAL_DATA_MANDATORY = ["age", "sex"]
ADDITIONAL_DATA_ALLOWED_SEX = {"M", "F", "U"}


class IndividualsSchema(ma.SQLAlchemyAutoSchema):
    id_individual = ma.auto_field(dump_only=True)

    class Meta:
        model = Individuals
        include_fk = True
        load_instance = True
        sqla_session = db.session
        include_relationships = False

    taxref = ma.Nested(TaxrefSchema, many=False)
    additional_data = fields.Dict(required=False, allow_none=True)

    @validates("additional_data")
    def validate_additional_data(self, value):
        if value is None:
            return
        if not isinstance(value, dict):
            raise ValidationError("additional_data must be a JSON object (dict).")

        errors = []
        if not all(field in value.keys() for field in ADDITIONAL_DATA_MANDATORY):
            errors.append(
                f"additional_data doit contenir tous ces champs : {ADDITIONAL_DATA_MANDATORY}."
            )

        age = value.get("age")
        if age is None:
            errors.append("additional_data.age est obligatoire.")
        elif isinstance(age, bool) or not isinstance(age, int):
            errors.append("additional_data.age doit etre un entier.")
        elif age < 0:
            errors.append("additional_data.age doit etre >= 0.")

        sex = value.get("sex")
        if sex is None or (isinstance(sex, str) and sex.strip() == ""):
            errors.append("additional_data.sex est obligatoire.")
        elif not isinstance(sex, str):
            errors.append("additional_data.sex doit etre une chaine.")
        else:
            if sex not in ADDITIONAL_DATA_ALLOWED_SEX:
                allowed = ", ".join(sorted(ADDITIONAL_DATA_ALLOWED_SEX))
                errors.append(f"additional_data.sex doit etre parmi : {allowed}.")

        if errors:
            raise ValidationError(errors)
