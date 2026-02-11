"""seed demo table

Revision ID: 2a0c9e4f3b7f
Revises: 943bedffa102
Create Date: 2025-01-10 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "2a0c9e4f3b7f"
down_revision = "943bedffa102"
branch_labels = None
depends_on = None

SCHEMA_NAME = "gn_demo"
TABLE_NAME = "t_demos"
PRIMARY_KEY = "id_demo"


def upgrade():
    op.execute(
        sa.text(
            f"""
            INSERT INTO {SCHEMA_NAME}.{TABLE_NAME} ({PRIMARY_KEY})
            VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10)
            ON CONFLICT ({PRIMARY_KEY}) DO NOTHING
            """
        )
    )


def downgrade():
    op.execute(
        sa.text(
            f"""
            DELETE FROM {SCHEMA_NAME}.{TABLE_NAME}
            WHERE {PRIMARY_KEY} IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
            """
        )
    )
