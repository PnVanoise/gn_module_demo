"""
Définition des routes du module export
"""

from flask import Blueprint
from werkzeug.exceptions import NotFound

from geonature.core.gn_permissions import decorators as permissions
from geonature.core.gn_permissions.decorators import login_required
from geonature.utils.env import db
from utils_flask_sqla.response import json_resp

from . import MODULE_CODE
from .models import Demo

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
