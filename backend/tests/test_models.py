"""Integration tests for database models.

These tests verify that all models can be imported, have the correct table names,
columns, and relationships. They do not require a live database connection.
"""

import uuid
from typing import cast

from sqlalchemy import Table

from app.models import Couple, Gift, GiftList, Reservation


def test_couple_model_table_name() -> None:
    assert Couple.__tablename__ == "couples"


def test_gift_list_model_table_name() -> None:
    assert GiftList.__tablename__ == "gift_lists"


def test_gift_model_table_name() -> None:
    assert Gift.__tablename__ == "gifts"


def test_reservation_model_table_name() -> None:
    assert Reservation.__tablename__ == "reservations"


def test_couple_has_expected_columns() -> None:
    columns = {c.name for c in Couple.__table__.columns}
    assert columns == {
        "id",
        "name",
        "email",
        "hashed_password",
        "pix_key",
        "pix_key_type",
        "email_notifications_enabled",
        "created_at",
    }


def test_gift_list_has_expected_columns() -> None:
    columns = {c.name for c in GiftList.__table__.columns}
    assert columns == {"id", "couple_id", "public_token", "title", "wedding_date", "created_at"}


def test_gift_has_expected_columns() -> None:
    columns = {c.name for c in Gift.__table__.columns}
    assert columns == {
        "id",
        "gift_list_id",
        "name",
        "description",
        "image_url",
        "price",
        "store_link",
        "is_reserved",
        "created_at",
    }


def test_reservation_has_expected_columns() -> None:
    columns = {c.name for c in Reservation.__table__.columns}
    assert columns == {"id", "gift_id", "guest_name", "guest_email", "reserved_at"}


def test_gift_list_public_token_is_unique() -> None:
    # public_token uniqueness is enforced via a unique index
    col = GiftList.__table__.c["public_token"]
    assert col.unique is True


def test_reservation_gift_id_is_unique() -> None:
    res_table = cast(Table, Reservation.__table__)
    for constraint in res_table.constraints:
        cols_attr = getattr(constraint, "columns", None)
        if cols_attr is not None:
            cols = [c.name for c in cols_attr]
            if cols == ["gift_id"] and getattr(constraint, "unique", False):
                return
            if type(constraint).__name__ == "UniqueConstraint" and cols == ["gift_id"]:
                return
    gift_id_col = res_table.c["gift_id"]
    assert gift_id_col.unique is True or any(
        type(c).__name__ == "UniqueConstraint"
        and [col.name for col in getattr(c, "columns", [])] == ["gift_id"]
        for c in res_table.constraints
    )


def test_models_can_be_instantiated_without_db() -> None:
    """Verify models accept expected keyword arguments."""
    couple = Couple(
        name="Ana & Bruno",
        email="ana@example.com",
        hashed_password="hashed",
    )
    assert couple.name == "Ana & Bruno"

    gift_list = GiftList(
        couple_id=uuid.uuid4(),
        title="Nossa Lista",
    )
    assert gift_list.title == "Nossa Lista"

    gift = Gift(
        gift_list_id=uuid.uuid4(),
        name="Liquidificador",
        price=299.90,
    )
    assert gift.name == "Liquidificador"

    reservation = Reservation(
        gift_id=uuid.uuid4(),
        guest_name="Carlos",
        guest_email="carlos@example.com",
    )
    assert reservation.guest_name == "Carlos"
