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


@pytest.mark.usefixtures("client_class")
class TestIndividuals:

    def test_get_individuals(self, users):
        with logged_user(self.client, users["admin_user"]):
            response = self.client.get(url_for("demo.list_individuals"))
        assert response.status_code == 200

    def test_get_individual_existing(self, users):
        with logged_user(self.client, users["admin_user"]):
            response = self.client.get(url_for("demo.indiv", id_individual=1))
        assert response.status_code == 200

    def test_get_individual_not_found(self, users):
        with logged_user(self.client, users["admin_user"]):
            response = self.client.get(url_for("demo.indiv", id_individual=999))
        assert response.status_code == 404

    def test_get_indiv2_contains_taxref_object(self, users):
        with logged_user(self.client, users["admin_user"]):
            response = self.client.get(url_for("demo.list_individuals"))
        assert response.status_code == 200
        payload = response.get_json()
        assert isinstance(payload, list)
        # If there is at least one individual, check structure
        if payload:
            first = payload[0]
            assert "id_individual" in first
            assert "individual_name" in first
            assert "taxref" in first
            
            tax = first["taxref"]

            # taxref can be None if no linked taxref, otherwise check keys
            if tax is not None:
                for k in ("classe", "ordre", "famille", "nom_vern"):
                    assert k in tax




