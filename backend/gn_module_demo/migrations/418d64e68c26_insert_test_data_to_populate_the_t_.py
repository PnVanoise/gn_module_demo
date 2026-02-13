"""insert test data to populate the t_individuals table

Revision ID: 418d64e68c26
Revises: e7b9c1d2a3f4
Create Date: 2026-01-27 12:25:57.484374

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '418d64e68c26'
down_revision = 'c9f1d2a3b4e5'
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        sa.text(
            """
            INSERT INTO gn_demo.t_individuals (id_individual, cd_nom, individual_name)
            VALUES
                (1, 3507, 'Chevêchette 1'),
                (2, 3507, 'Chevêchette 2'),
                (3, 3424, 'Palombe 1'),
                (4, 4665, 'Ortolan 1'),
                (5, 61283, 'Campagnol 1'),
                (6, 60577, 'Loup 1')
            ON CONFLICT (id_individual) DO NOTHING
            """
        )
    )


def downgrade():
    op.execute(
        sa.text(
            """
            DELETE FROM gn_demo.t_individuals
            WHERE id_individual IN (1,2,3,4,5,6)
            """
        )
    )
