from types import SimpleNamespace

import pytest

from gn_module_demo.blueprint import (
    _build_back_populates_demo,
    _build_backref_demo,
    _build_inmemory_joinedload_demo,
    _serialize_individuals_manual,
)


@pytest.mark.unit
def test_serialize_individuals_manual_handles_taxref_and_none():
    taxref = SimpleNamespace(cd_nom=123, nom_complet="Testus taxrefus")
    with_taxref = SimpleNamespace(
        id_individual=1,
        name_individual="Ind 1",
        cd_nom=123,
        taxref=taxref,
    )
    without_taxref = SimpleNamespace(
        id_individual=2,
        name_individual="Ind 2",
        cd_nom=None,
        taxref=None,
    )

    result = _serialize_individuals_manual([with_taxref, without_taxref])

    assert result[0]["taxref"]["cd_nom"] == 123
    assert result[0]["taxref"]["nom_complet"] == "Testus taxrefus"
    assert result[1]["taxref"] is None


@pytest.mark.unit
def test_build_backref_demo_links_parent_child():
    parent, child = _build_backref_demo()

    assert child.parent is parent
    assert parent.children[0] is child


@pytest.mark.unit
def test_build_back_populates_demo_links_parent_child():
    parent, child = _build_back_populates_demo()

    assert child.parent is parent
    assert parent.children[0] is child


@pytest.mark.unit
def test_build_inmemory_joinedload_demo():
    data = _build_inmemory_joinedload_demo()

    assert data["children_count_first_parent"] == 2
    assert len(data["raw_parent_ids"]) >= len(data["unique_parent_ids"])
