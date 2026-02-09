import csv
from io import StringIO

import pytest
from flask import url_for

from geonature.utils.config import config as gn_config

from gn_module_demo import MODULE_CODE


def _demo_prefix():
    module_config = gn_config.get(MODULE_CODE, {})
    url_prefix = module_config.get("MODULE_API", "/demo")
    if not url_prefix.startswith("/"):
        url_prefix = f"/{url_prefix}"
    return url_prefix


@pytest.mark.integration
def test_examples_backref(admin_client):
    response = admin_client.get(url_for("demo.demo_backref"))

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["parent"]["children_count"] == 1
    assert payload["child"]["parent_name"] == "Parent A"


@pytest.mark.integration
def test_examples_back_populates(admin_client):
    response = admin_client.get(url_for("demo.demo_back_populates"))

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["parent"]["children_count"] == 1
    assert payload["child"]["parent_name"] == "Parent B"


@pytest.mark.integration
def test_examples_inmemory_joinedload(admin_client):
    response = admin_client.get(url_for("demo.demo_inmemory_joinedload_parent_children"))

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["children_count_first_parent"] == 2


@pytest.mark.integration
@pytest.mark.usefixtures("individuals_batch")
@pytest.mark.parametrize(
    "endpoint",
    [
        "demo.list_individuals_joinedload",
        "demo.list_individuals_selectinload",
        "demo.list_individuals_lazy",
        "demo.list_individuals_noload",
        "demo.list_individuals_defer",
        "demo.demo_query_load_only",
        "demo.demo_query_select_columns",
        "demo.demo_loading_annotated",
    ],
)
def test_loading_endpoints_return_expected_keys(admin_client, endpoint):
    response = admin_client.get(url_for(endpoint))

    assert response.status_code == 200
    payload = response.get_json()
    assert isinstance(payload, dict)
    assert payload


@pytest.mark.integration
@pytest.mark.usefixtures("individuals_batch")
def test_export_individuals_csv(admin_client):
    response = admin_client.get(url_for("demo.export_individuals_csv"))

    assert response.status_code == 200
    assert response.mimetype == "text/csv"

    content = response.get_data(as_text=True)
    reader = csv.reader(StringIO(content))
    header = next(reader)

    assert header == ["id_individual", "name_individual", "cd_nom"]


@pytest.mark.integration
def test_taxref_autocomplete_empty_query_returns_empty(admin_client):
    response = admin_client.get(url_for("demo.taxref_autocomplete_legacy"))

    assert response.status_code == 200
    assert response.get_json() == []


@pytest.mark.integration
def test_taxref_autocomplete_respects_limit(admin_client, taxref_sample):
    query = (taxref_sample.nom_complet or "").strip()
    if not query:
        pytest.skip("Taxref.nom_complet vide: impossible de tester l'autocomplete.")
    query = query[:3]

    response = admin_client.get(
        url_for("demo.taxref_autocomplete_legacy"),
        query_string={"q": query, "limit": 1},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert len(payload) <= 1
    if payload:
        assert "cd_nom" in payload[0]
        assert "nom_complet" in payload[0]


@pytest.mark.integration
def test_taxref_autocomplete_new_route_empty_query_returns_empty(admin_client):
    response = admin_client.get(url_for("demo.taxref_autocomplete"))

    assert response.status_code == 200
    assert response.get_json() == []


@pytest.mark.integration
def test_taxref_autocomplete_new_route_respects_limit(admin_client, taxref_sample):
    query = (taxref_sample.nom_complet or "").strip()
    if not query:
        pytest.skip("Taxref.nom_complet vide: impossible de tester l'autocomplete.")
    query = query[:3]

    response = admin_client.get(
        url_for("demo.taxref_autocomplete"),
        query_string={"q": query, "limit": 1},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert len(payload) <= 1
    if payload:
        assert "cd_nom" in payload[0]
        assert "nom_complet" in payload[0]
