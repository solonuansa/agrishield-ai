"""create alerts and alert_reads tables

Revision ID: 004
Revises: 003
Create Date: 2026-03-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("disease", sa.String(100), nullable=False),
        sa.Column("crop_type", sa.String(20), nullable=False),
        sa.Column("center_latitude", sa.Float, nullable=False),
        sa.Column("center_longitude", sa.Float, nullable=False),
        sa.Column("area_name", sa.String(255), nullable=True),
        sa.Column("case_count", sa.Integer, nullable=False, default=1),
        sa.Column("radius_km", sa.Float, nullable=False, default=50.0),
        sa.Column("severity", sa.String(20), nullable=False, default="medium"),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, default="active"),
        sa.Column("detected_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("detected_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_alerts_disease", "alerts", ["disease"])
    op.create_index("ix_alerts_status", "alerts", ["status"])

    op.create_table(
        "alert_reads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "alert_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("alerts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "read_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_alert_reads_user_id", "alert_reads", ["user_id"])
    op.create_index("ix_alert_reads_alert_id", "alert_reads", ["alert_id"])


def downgrade() -> None:
    op.drop_index("ix_alert_reads_alert_id", table_name="alert_reads")
    op.drop_index("ix_alert_reads_user_id", table_name="alert_reads")
    op.drop_table("alert_reads")

    op.drop_index("ix_alerts_status", table_name="alerts")
    op.drop_index("ix_alerts_disease", table_name="alerts")
    op.drop_table("alerts")
