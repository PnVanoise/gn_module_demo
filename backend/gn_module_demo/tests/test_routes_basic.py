import pytest
from flask import url_for
from pypnusershub.tests.utils import logged_user
from geonature.utils.env import db

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


@pytest.mark.usefixtures("client_class")
class TestIndividuals:

    def test_get_individuals(self, install_module_test_indi, users):
        with logged_user(self.client, users["admin_user"]):
            response = self.client.get(url_for("demo.list_individuals", id_individuals=1))
        assert response.status_code == 200
        