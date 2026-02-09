import pytest
from marshmallow import ValidationError

from gn_module_demo.schema import IndividualsSchema

pytestmark = pytest.mark.usefixtures("app")


@pytest.mark.unit
@pytest.mark.parametrize(
    "payload",
    [
        {"additional_data": {"age": 2}},
        {"additional_data": {"sex": "F"}},
        {"additional_data": "not-a-dict"},
    ],
    ids=["missing-sex", "missing-age", "wrong-type"],
)
def test_individuals_schema_rejects_invalid_additional_data(payload):
    schema = IndividualsSchema()

    with pytest.raises(ValidationError) as excinfo:
        schema.load(payload)

    assert "additional_data" in excinfo.value.messages


@pytest.mark.unit
def test_individuals_schema_accepts_valid_additional_data(individual_payload):
    schema = IndividualsSchema()

    individual = schema.load(individual_payload)

    assert individual.additional_data["age"] == 3
    assert individual.additional_data["sex"] == "F"


@pytest.mark.xfail(reason="Le validateur exige age + sex, pas 'au moins un'.")
def test_individuals_schema_accepts_one_field_only():
    schema = IndividualsSchema()

    individual = schema.load({"additional_data": {"age": 1}})

    assert individual.additional_data["age"] == 1