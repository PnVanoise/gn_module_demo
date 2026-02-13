"""
Définition des routes du module export
"""

import logging

from flask import Blueprint, request
# from flask_marshmallow import Schema
from werkzeug.exceptions import NotFound, BadRequest
from sqlalchemy.orm import joinedload

from geonature.core.gn_permissions import decorators as permissions
from geonature.core.gn_permissions.decorators import login_required
from geonature.utils.env import db
from utils_flask_sqla.response import json_resp

from . import MODULE_CODE
from .models import Demo, Individual
from apptax.taxonomie.models import Taxref
from .schema import IndividualSchema

logger = logging.getLogger(__name__)
blueprint = Blueprint("demo", __name__, cli_group="demo")

## ########################################################################
## COLLECTION
## ########################################################################

@blueprint.route("/", methods=["GET"])
@login_required
@json_resp
def list_demos():
    # Order by
    query = db.select(Demo)
    demos = db.session.execute(query).scalars().all()
    return [{"id_demo": demo.id_demo} for demo in demos]

## ########################################################################
## ENTITY - GET
## ########################################################################

@blueprint.route("/<int(signed=True):id_demo>", methods=["GET"])
@login_required
@json_resp
def demo(id_demo):
    query = db.select(Demo)
    demo = (
        db.session.scalars(query.filter_by(id_demo=id_demo))
        .unique()
        .one_or_none()
    )
    if demo is None:
        raise NotFound(f"Demo {id_demo} not found")
    return {"id_demo": demo.id_demo}

@blueprint.route("/indiv", methods=["GET"])
@login_required
@json_resp
def list_individuals():
    # Un schéma doit être créé
    schema = IndividualSchema()

    query = db.select(Individual).options(joinedload(Individual.taxref))
    # sql = query.compile(
    #     dialect=postgresql.dialect(),
    #         compile_kwargs={"literal_binds": True},
    # )
    # logger.info("SQL: %s", sql)
   
    indivs = db.session.execute(query).scalars().all()
    logger.info(f"------- indivs log: {indivs}")

    return schema.dump(indivs, many=True)


@blueprint.route("/indiv/<int(signed=True):id_individual>", methods=["GET"])
@login_required
@json_resp
def indiv(id_individual):
    query = db.select(Individual).options(joinedload(Individual.taxref))
    indiv = (
        db.session.scalars(query.filter_by(id_individual=id_individual))
        .unique()
        .one_or_none()
    )
    if indiv is None:
        raise NotFound(f"Individual {id_individual} not found")
    schema = IndividualSchema()
    return schema.dump(indiv)


@blueprint.route("/indiv", methods=["POST"])
@login_required
@json_resp
def create_individual():
    payload = request.get_json(silent=True)
    if payload is None:
        raise BadRequest("JSON body is required")
    schema = IndividualSchema()
    individual = schema.load(payload)
    db.session.add(individual)
    db.session.commit()
    return schema.dump(individual)
    