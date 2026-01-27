from geonature.utils.env import db, ma
from apptax.taxonomie.schemas import TaxrefSchema
from utils_flask_sqla.schema import SmartRelationshipsMixin
from marshmallow import fields, validates, ValidationError
from apptax.taxonomie.models import Taxref

from .models import Individual

ADDITIONAL_DATA_ALLOWED_KEYS = ["collier", "taille_cm"]

class IndividualSchema(SmartRelationshipsMixin, ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Individual
        include_fk = True
        load_instance = True
        sqla_session = db.session

    taxref = ma.Nested(TaxrefSchema)

    @validates("additional_data")
    # create an instance method that takes a value for additional_data
    def validates_additional_data(self, additional_data):

        if additional_data is not None and not isinstance(additional_data, dict):
            raise ValidationError("additional_data must be a JSON object (dict).")

        if not all(field in additional_data.keys() for field in ADDITIONAL_DATA_ALLOWED_KEYS):
            raise ValidationError(
                f"additional_data must contains these fields: {ADDITIONAL_DATA_ALLOWED_KEYS}."
            )

        # Tester si le cd_nom de additionnal_data existe dans Taxref
        cd_nom_payload = additional_data.get("cd_nom")
        if cd_nom_payload is not None:
            cd_nom_additional = db.session.execute(
                db.select(Taxref).filter_by(cd_nom=cd_nom_payload)
            ).scalars.one_or_none()

            if cd_nom_additional is None:
                raise ValidationError(
                    f"cd_nom {cd_nom_payload} in additional_data does not exist in taxref."
                )
            return additional_data