"""create individuals table

Revision ID: 7f4d2c9a1e3b
Revises: 2a0c9e4f3b7f
Create Date: 2025-02-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "7f4d2c9a1e3b"
down_revision = "2a0c9e4f3b7f"
branch_labels = None
depends_on = None

SCHEMA_NAME = "gn_demo"
TABLE_NAME = "t_individuals"
PRIMARY_KEY = "id_individual"


def upgrade():
    op.create_table(
        TABLE_NAME,
        sa.Column(
            PRIMARY_KEY,
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
        ),
        sa.Column("name_individual", sa.String(length=255)),
        sa.Column("cd_nom", sa.Integer(), sa.ForeignKey("taxonomie.taxref.cd_nom")),
        schema=SCHEMA_NAME,
    )

    op.execute(sa.text(f"""
            INSERT INTO {SCHEMA_NAME}.{TABLE_NAME} (name_individual, cd_nom)
            SELECT v.name_individual,
                   (
                       SELECT t.cd_nom
                       FROM taxonomie.taxref t
                       ORDER BY t.cd_nom
                       LIMIT 1 OFFSET v.idx - 1
                   )
            FROM (
                VALUES
                    (1, 'Individu A'),
                    (2, 'Individu B'),
                    (3, 'Individu C')
            ) AS v (idx, name_individual)
            """))


def downgrade():
    op.drop_table(TABLE_NAME, schema=SCHEMA_NAME)
