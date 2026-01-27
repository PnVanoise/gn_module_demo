from geonature.utils.env import DB
from sqlalchemy.dialects.postgresql import JSONB

from apptax.taxonomie.models import Taxref

from sqlalchemy.ext.hybrid import hybrid_property

SCHEMA_NAME = "gn_demo"


class Demo(DB.Model):
    __tablename__ = "t_demos"
    __table_args__ = {"schema": SCHEMA_NAME}

    id_demo = DB.Column(
        "id_demo",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )


class Individual(DB.Model):
    __tablename__ = "t_individuals"
    __table_args__ = {"schema": SCHEMA_NAME}

    id_individual = DB.Column(
        "id_individual",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )

    name = DB.Column(
        "name",
        DB.Text,
        nullable=True,
    )

    cd_nom = DB.Column("cd_nom", DB.Integer, DB.ForeignKey(Taxref.cd_nom))

    additional_data = DB.Column(
        "additional_data",
        JSONB,
        nullable=True,
        # Permet de faire générer pour alembic une valeur par défaut
        server_default="{}",
    )

    taxref = DB.relationship(
        Taxref,
        lazy="joined",
        viewonly=True,
    )

