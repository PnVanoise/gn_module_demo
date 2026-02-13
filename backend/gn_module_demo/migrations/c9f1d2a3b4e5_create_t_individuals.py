"""create_t_individuals

Revision ID: c9f1d2a3b4e5
Revises: 2a0c9e4f3b7f
Create Date: 2026-01-27 10:30:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c9f1d2a3b4e5"
down_revision = "2a0c9e4f3b7f"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "t_individuals",
        sa.Column("id_individual", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("individual_name", sa.String(length=255), nullable=False),
        sa.Column("cd_nom", sa.Integer(), sa.ForeignKey("taxonomie.taxref.cd_nom"), nullable=False),
        sa.Column("additional_data", sa.JSON(), nullable=True, server_default=sa.text("'{}'::json")),
        sa.Column("last_observation_date", sa.DateTime(timezone=True), nullable=True),
        schema="gn_demo",
    )


def downgrade():
    op.drop_table("t_individuals", schema="gn_demo")

