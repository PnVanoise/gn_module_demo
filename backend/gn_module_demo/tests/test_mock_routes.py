from unittest.mock import Mock

import pytest
from flask import url_for

import gn_module_demo.blueprint as demo_blueprint_module


@pytest.mark.integration
def test_mock_calls_route_uses_repo_for_each_strategy(admin_client, monkeypatch):
    mock_repo = Mock(return_value=[object(), object(), object()])
    monkeypatch.setattr(demo_blueprint_module, "repo_list_individuals_with_taxref", mock_repo)

    response = admin_client.get(
        url_for("demo.demo_mock_calls", strategy=["joined", "selectin"])
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["strategies"][0]["strategy"] == "joined"
    assert payload["strategies"][0]["count"] == 3
    assert payload["strategies"][1]["strategy"] == "selectin"
    assert payload["strategies"][1]["count"] == 3

    assert mock_repo.call_count == 2
    mock_repo.assert_any_call(load_strategy="joined")
    mock_repo.assert_any_call(load_strategy="selectin")


@pytest.mark.integration
def test_mock_args_route_passes_values(admin_client, monkeypatch):
    mock_repo = Mock(return_value={"sum": 5, "product": 6})
    monkeypatch.setattr(demo_blueprint_module, "repo_compute_demo_stats", mock_repo)

    response = admin_client.get(url_for("demo.demo_mock_args", a=2, b=3))

    assert response.status_code == 200
    assert response.get_json() == {"sum": 5, "product": 6}
    mock_repo.assert_called_once_with(2, 3)


@pytest.mark.integration
def test_mock_error_route_handles_exception(admin_client, monkeypatch):
    mock_repo = Mock(side_effect=RuntimeError("boom"))
    monkeypatch.setattr(demo_blueprint_module, "repo_raise_for_demo", mock_repo)

    response = admin_client.get(url_for("demo.demo_mock_error", fail="true"))

    assert response.status_code == 400
    mock_repo.assert_called_once_with(True)
