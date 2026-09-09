"""initial schema

Revision ID: fe932ce5b6e1
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fe932ce5b6e1"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "couples",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("pix_key", sa.String(length=140), nullable=True),
        sa.Column("pix_key_type", sa.String(length=20), nullable=True),
        sa.Column("email_notifications_enabled", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_couples_email"), "couples", ["email"], unique=True)

    op.create_table(
        "gift_lists",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("couple_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("public_token", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("wedding_date", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["couple_id"], ["couples.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("public_token"),
    )
    op.create_index(
        op.f("ix_gift_lists_public_token"), "gift_lists", ["public_token"], unique=True
    )

    op.create_table(
        "gifts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("gift_list_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("store_link", sa.String(length=2048), nullable=True),
        sa.Column("is_reserved", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["gift_list_id"], ["gift_lists.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "reservations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("gift_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("guest_name", sa.String(length=200), nullable=False),
        sa.Column("guest_email", sa.String(length=254), nullable=False),
        sa.Column(
            "reserved_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["gift_id"], ["gifts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("gift_id"),
    )


def downgrade() -> None:
    op.drop_table("reservations")
    op.drop_table("gifts")
    op.drop_index(op.f("ix_gift_lists_public_token"), table_name="gift_lists")
    op.drop_table("gift_lists")
    op.drop_index(op.f("ix_couples_email"), table_name="couples")
    op.drop_table("couples")
