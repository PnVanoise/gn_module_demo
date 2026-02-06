from sqlalchemy.dialects.postgresql import JSONB

from apptax.taxonomie.models import Taxref
from geonature.utils.env import DB


class Demo(DB.Model):
    __tablename__ = "t_demos"
    __table_args__ = {"schema": "gn_demo"}

    id_demo = DB.Column(
        "id_demo",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )


class Individuals(DB.Model):
    __tablename__ = "t_individuals"
    __table_args__ = {"schema": "gn_demo"}

    id_individual = DB.Column(
        "id_individual",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )

    name_individual = DB.Column(
        "name_individual",
        DB.String(255),
    )

    cd_nom = DB.Column(
        "cd_nom",
        DB.Integer,
        DB.ForeignKey(Taxref.cd_nom),
    )

    additional_data = DB.Column(
        "additional_data",
        JSONB,
        nullable=True,
        server_default="{}",
    )

    taxref = DB.relationship(
        Taxref,
        foreign_keys=[cd_nom],
        lazy="select",
    )
