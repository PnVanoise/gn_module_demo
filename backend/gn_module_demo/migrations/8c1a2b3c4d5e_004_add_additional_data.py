"""add additional_data jsonb to individuals

Revision ID: 8c1a2b3c4d5e
Revises: 7f4d2c9a1e3b
Create Date: 2026-01-23 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "8c1a2b3c4d5e"
down_revision = "7f4d2c9a1e3b"
branch_labels = None
depends_on = None

SCHEMA_NAME = "gn_demo"
TABLE_NAME = "t_individuals"
COLUMN_NAME = "additional_data"


def upgrade():
    op.add_column(
        TABLE_NAME,
        sa.Column(
            COLUMN_NAME,
            postgresql.JSONB(),
            nullable=True,
            server_default=sa.text("'{}'::jsonb"),
        ),
        schema=SCHEMA_NAME,
    )


def downgrade():
    op.drop_column(TABLE_NAME, COLUMN_NAME, schema=SCHEMA_NAME)
