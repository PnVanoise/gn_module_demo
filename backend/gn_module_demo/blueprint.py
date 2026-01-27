"""
Définition des routes du module export
"""

import logging
from geonature.contrib.gn_module_validation.backend.gn_module_validation import schema
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import joinedload

from flask import Blueprint
from werkzeug.exceptions import NotFound

from geonature.core.gn_permissions import decorators as permissions
from geonature.core.gn_permissions.decorators import login_required
from geonature.utils.env import db
from utils_flask_sqla.response import json_resp

from . import MODULE_CODE
from .models import Demo, Individual
from apptax.taxonomie.models import Taxref
from .schemas import IndividualSchema

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

# ########################################################################
# Sans sérialiser marshmallow
# 
# @blueprint.route("/indiv", methods=["GET"])
# @login_required
# @json_resp
# def indiv():
#     query = db.select(
#                 Individual.id_individual,
#                 Individual.name,
#                 Taxref.nom_complet
#             ).select_from(Individual).join(Taxref, Individual.cd_nom == Taxref.cd_nom)
#     # sql = query.compile(
#     #     dialect=postgresql.dialect(),
#     #         compile_kwargs={"literal_binds": True},
#     # )
#     # logger.info("SQL: %s", sql)

#     indivs = db.session.execute(query).all()
#     logger.info(f"------- indivs log: {indivs}")

#     return [{"id_individual": indiv.id_individual, "name": indiv.name, "nom_complet": indiv.nom_complet} for indiv in indivs]

# ########################################################################
# Avec sérialiseur marshmallow
# 
@blueprint.route("/indiv", methods=["GET"])
@login_required
@json_resp
def indiv():
    # Un schéma doit être créé
    schema = IndividualSchema()

    query = db.select(Individual).options(joinedload(Individual.taxref))
    # sql = query.compile(
    #     dialect=postgresql.dialect(),
    #         compile_kwargs={"literal_binds": True},
    # )
    # logger.info("SQL: %s", sql)
   
    indivs = db.session.execute(query).all()
    logger.info(f"------- indivs log: {indivs}")

    return schema.dump(indivs, many=True)