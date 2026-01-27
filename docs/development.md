# Doc pour le developement dans l'environnement de GeoNature

L'idée de cette doc est de servir de mémo, de lister différentes astuces ...

## Backend

### Logs

Pour insérer les logs dans les fichiers de log `/var/log/geonature/geonature.log`

```python
import logging
logger = logging.getLogger(__name__)

[...]

logger.info("SQL: %s", sql) # ou logger.debug selon le niveau souhaité
```

### SQLAlchemy

#### `scalars()`

Cette fonction permet de retourner les objets du modèle et non des dictionnaires

```python
## ----- blueprint.py
indivs = db.session.execute(query).scalars().all()
```

Idem que

```python
indivs = db.session.scalars(query).unique().all()
```

#### `@hybrid_property`

Pour que le champ d'un modèle soit le résultat de l'appel à une fonction :

```python
# ----- models.py
class Individual(DB.Model):
    [...]
    @hybrid_property
    def nom_complet(self):
        return self.taxref.nom_complet if self.taxref else None
```

### Sérialiser

#### Sans marshmallow

> [!WARNING]
> A ne plus utiliser : Méthode dépréciée pour GeoNature, seule la sérialisation avec marshmallow est acceptée !**

```python
@blueprint.route("/indiv", methods=["GET"])
@login_required
@json_resp
def indiv():
    query = db.select(
                Individual.id_individual,
                Individual.name,
                Taxref.nom_complet
             ).select_from(Individual).join(Taxref, Individual.cd_nom == Taxref.cd_nom)
    indivs = db.session.execute(query).all()

    return [{"id_individual": indiv.id_individual, "name": indiv.name, "nom_complet": indiv.nom_complet} for indiv in indivs]
```

#### Avec marshmallow

> [!NOTE]
> La sérialisation avec marshmallow est la méthode recommandée par la communauté GeoNature.

##### Exemple de sérialisation avec un schéma marshmallow

```python
## ----- shemas.py
from geonature.utils.env import ma
[...]

class IndividualSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Individual
        include_fk = True
        include_relationships = True
        load_instance = True
        sqla_session = db.session

    taxref = ma.Nested(TaxrefSchema)

## ----- blueprint.py
@blueprint.route("/indiv/<int(signed=True):id_individual>", methods=["GET"])
@login_required
@json_resp
def indiv(id_individual):
    # Un schéma doit être créé
    schema = IndividualSchema(many=True)

    query = (
        db.select(Individual)
        .options(joinedload(Individual.taxref))
        .filter_by(id_individual=id_individual)
    )

    indivs = db.session.execute(query).one_or_none()

    # Sérialisation
    return schema.dump(indivs)
```

##### Utilisation de `Method()` dans le schema

```python
## ----- shemas.py
class IndividualSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        [...]

    # Si on ne veut pas le taxref imbriqué mais directement le nom_complet
    nom_complet = fields.Method("get_nom_complet")

    def get_nom_complet(self, obj):
        return obj.taxref.nom_complet if obj.taxref else None
```

##### Validation d'une donnée dans le schéma

```python
ADDITIONAL_DATA_ALLOWED_KEYS = ["collier", "taille_cm"]

class IndividualSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        [...]

    # Mise en place d'une validation sur le champ addtional_data
    @validates("additional_data")
    def validates_additional_data(self, additional_data):

        # Test du type de donnée
        if additional_data is not None and not isinstance(additional_data, dict):
            raise ValidationError("additional_data must be a JSON object (dict).")

        # Test de la valeur des champs : au moins tous les champs de ADDITIONAL_DATA_ALLOWED_KEYS doivent être définis
        if not all(field in additional_data.keys() for field in ADDITIONAL_DATA_ALLOWED_KEYS):
            raise ValidationError(
                f"additional_data must contains these fields: {ADDITIONAL_DATA_ALLOWED_KEYS}."
            )

        # Tester si le cd_nom de additionnal_data existe dans Taxref
        cd_nom_payload = additional_data.get("cd_nom")
        if cd_nom_payload is not None:
            cd_nom_additional = db.session.execute(
                db.select(Taxref).filter_by(cd_nom=cd_nom_payload)
            ).scalars.one_or_none()

            if cd_nom_additional is None:
                raise ValidationError(
                    f"cd_nom {cd_nom_payload} in additional_data does not exist in taxref."
                )
            return additional_data
```

##### Mixin or not ?

`SmartRelationshipsMixin` force à ne pas charger les relations ships et c'est cette méthode qui est préconisée par les développeurs.

Les 2 exemples suivants démontrent comment utiliser 2 méthodes pour sérialiser le champ `taxref` du model `Individual` qui est une relationship définie par la ForeignKey sur le champ `cd_nom`

Exemple avec l'utilisation du Mixin :

```python
## ----- shemas.py
class IndividualSchema(SmartRelationshipsMixin, ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Individual
        include_fk = True
        load_instance = True
        sqla_session = db.session

    taxref = ma.Nested(TaxrefSchema)

## ----- models.py
class Individual(DB.Model):
    __tablename__ = "t_individuals"
    __table_args__ = {"schema": SCHEMA_NAME}

    id_individual = DB.Column(
        "id_individual",
        DB.Integer,
        primary_key=True,
        autoincrement=True,
    )

    name = DB.Column(
        "name",
        DB.Text,
        nullable=True,
    )

    cd_nom = DB.Column("cd_nom", DB.Integer, DB.ForeignKey(Taxref.cd_nom))

    additional_data = DB.Column(
        "additional_data",
        JSONB,
        nullable=True,
        server_default="{}",
    )

    taxref = DB.relationship(
        Taxref,
        lazy="joined",
        viewonly=True,
    )

## ----- blueprint.py
@blueprint.route("/indiv", methods=["GET"])
@login_required
@json_resp
def list_indiv():
    # C'est ce paramètre "only" qui fait toute la différence !
    schema = IndividualSchema(many=True, only=["taxref"])

    query = db.select(Individual).options(joinedload(Individual.taxref))

    indivs = db.session.execute(query).scalars().all()

    return schema.dump(indivs)
```

Exemple sans l'utilisation du Mixin :

```python
## ----- shemas.py
# On retire le Mixin
class IndividualSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Individual
        include_fk = True
        load_instance = True
        sqla_session = db.session

    taxref = ma.Nested(TaxrefSchema)

## ----- models.py
# Rien ne change côté model

## ----- blueprint.py
@blueprint.route("/indiv", methods=["GET"])
@login_required
@json_resp
def list_indiv():
    # On retire le paramètre "only"
    schema = IndividualSchema(many=True)

    query = db.select(Individual).options(joinedload(Individual.taxref))

    indivs = db.session.execute(query).scalars().all()

    return schema.dump(indivs)
```
