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
ADDITIONAL_DATA_MANDATORY = ["age", "sex"]


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
        if value is not None and not isinstance(value, dict):
            raise ValidationError("additional_data must be a JSON object (dict).")
        cd_nom_payload = value.get("cd_nom")
        if cd_nom_payload is not None:
            cd_nom_additional = db.select(Taxref).filter_by(cd_nom=cd_nom_payload)
            print(cd_nom_additional)

        if not all(field in value.keys() for field in ADDITIONAL_DATA_MANDATORY):
            raise ValidationError(
                f"additional_data must contains at least one of these fields: {ADDITIONAL_DATA_MANDATORY}."
            )
