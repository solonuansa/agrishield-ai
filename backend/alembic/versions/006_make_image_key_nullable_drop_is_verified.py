"""make image_key nullable, drop is_verified from users, add scan index

Revision ID: 006
Revises: 005
Create Date: 2026-06-18
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Scan: image_key jadi nullable (scan dibuat dulu sebelum upload)
    op.alter_column("scans", "image_key", existing_type=sa.String(500), nullable=True)

    # User: drop field is_verified yang tidak dipakai
    op.drop_column("users", "is_verified")

    # Scan: composite index untuk lookup outbreak detection
    op.create_index(
        "ix_scan_outbreak_lookup",
        "scans",
        ["status", "created_at", "latitude", "longitude"],
        postgresql_using="btree",
    )


def downgrade() -> None:
    op.drop_index("ix_scan_outbreak_lookup", table_name="scans")
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.alter_column("scans", "image_key", existing_type=sa.String(500), nullable=False)
