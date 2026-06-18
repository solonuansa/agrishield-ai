"""add unique constraint on alerts (disease, crop_type)

Revision ID: 007
Revises: 006
Create Date: 2026-06-18
"""

from typing import Sequence, Union

from alembic import op

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Hapus duplicate alert jika ada sebelum menambahkan unique constraint
    op.execute(
        """
        DELETE FROM alerts a1 USING (
            SELECT MIN(id) as id, disease, crop_type
            FROM alerts
            GROUP BY disease, crop_type
            HAVING COUNT(*) > 1
        ) a2
        WHERE a1.disease = a2.disease
          AND a1.crop_type = a2.crop_type
          AND a1.id != a2.id
        """
    )
    op.create_unique_constraint("uq_alert_disease_crop", "alerts", ["disease", "crop_type"])


def downgrade() -> None:
    op.drop_constraint("uq_alert_disease_crop", "alerts", type_="unique")
