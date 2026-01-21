import pytest
from flask import url_for
from pypnusershub.tests.utils import logged_user


def test_demo_list_returns_list(client, users):
    with logged_user(client, users["admin_user"]):
        response = client.get(url_for("demo.list_demos"))

    assert response.status_code == 200
    payload = response.get_json()
    assert isinstance(payload, list)


def test_demo_get_not_found(client, users):
    with logged_user(client, users["admin_user"]):
        response = client.get(url_for("demo.demo", id_demo=-1))

    assert response.status_code == 404
