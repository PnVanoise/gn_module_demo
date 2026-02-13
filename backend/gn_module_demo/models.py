from geonature.utils.env import DB
from sqlalchemy.orm import relationship
from apptax.taxonomie.models import Taxref


class Demo(DB.Model):
    __tablename__ = "t_demos"
    __table_args__ = {"schema": "gn_demo"}

    id_demo = DB.Column(
        "id_demo",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )


class Individual(DB.Model):
    __tablename__ = "t_individuals"
    __table_args__ = {"schema": "gn_demo"}

    id_individual = DB.Column(
        "id_individual",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )

    cd_nom = DB.Column(
        "cd_nom",
        DB.Integer,
        DB.ForeignKey(Taxref.cd_nom),
        nullable=True,
    )

    taxref = DB.relationship(
        Taxref,
        primaryjoin=(Taxref.cd_nom == cd_nom),
        foreign_keys=[cd_nom],
        lazy="select",
    )
    # taxref = relationship("Taxref", back_populates="indivs")
    # taxref = relationship("Taxref", backref="indivs")

    additional_data = DB.Column(
        "additional_data",
        DB.JSON,
        nullable=True,
        server_default="{}",
    )

    individual_name = DB.Column(
        "individual_name",
        DB.String(255),
        nullable=True,
    )

    last_observation_date = DB.Column(
        "last_observation_date",
        DB.DateTime(timezone=True),
        nullable=True,
    )
