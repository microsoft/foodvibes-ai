from typing import Any

from pydantic import BaseModel
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    FetchedValue,
    Float,
    Integer,
    String,
    Unicode,
)
from sqlalchemy.orm import declarative_base

base = declarative_base()


class FoodvibesConstants(base):
    __tablename__ = "foodvibes_constants"
    constant_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    group_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    constant_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    constant_value = Column(Integer, nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesGeotrack(base):
    __tablename__ = "foodvibes_geotrack"
    ledger_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    geotrack_id = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"), nullable=False, index=True)
    name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    details = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    latitude = Column(Float(53), nullable=False)
    longitude = Column(Float(53), nullable=False)
    recorded_at = Column(DateTime)
    properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation = Column(Integer, server_default=FetchedValue())
    image_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime, server_default=FetchedValue())
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesGeotrackLedgerView(base):
    __tablename__ = "foodvibes_geotrack_ledger_view"
    orm_id = Column(Integer, primary_key=True, nullable=False)
    is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    geotrack_ledger_id = Column(Integer, nullable=False)
    geotrack_tx_id = Column(BigInteger, nullable=False)
    geotrack_id = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    details = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    latitude = Column(Float(53), nullable=False)
    longitude = Column(Float(53), nullable=False)
    recorded_at = Column(DateTime)
    properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    image_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    image_url = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime)
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)


class FoodvibesProduct(base):
    __tablename__ = "foodvibes_product"
    ledger_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    product_id = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"), nullable=False, index=True)
    description = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    quantity = Column(Integer, nullable=False)
    storage_tier = Column(Integer, nullable=False)
    recorded_at = Column(DateTime)
    properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation = Column(Integer, server_default=FetchedValue())
    image_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime, server_default=FetchedValue())
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesProductLedgerView(base):
    __tablename__ = "foodvibes_product_ledger_view"
    orm_id = Column(Integer, primary_key=True, nullable=False)
    is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    product_ledger_id = Column(Integer, nullable=False)
    product_tx_id = Column(BigInteger, nullable=False)
    product_id = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    description = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    quantity = Column(Integer, nullable=False)
    storage_tier = Column(Integer, nullable=False)
    recorded_at = Column(DateTime)
    properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    image_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    image_url = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime)
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)


class FoodvibesScCircle(base):
    __tablename__ = "foodvibes_sc_circle"
    ledger_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    sc_group_ledger_id = Column(Integer, nullable=False)
    sc_user_ledger_id = Column(Integer, nullable=False)
    access_mask = Column(Integer, nullable=False)
    deleted = Column(Boolean)
    operation = Column(Integer, server_default=FetchedValue())
    created_at = Column(DateTime, server_default=FetchedValue())
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesScCircleLedgerView(base):
    __tablename__ = "foodvibes_sc_circle_ledger_view"
    orm_id = Column(Integer, primary_key=True, nullable=False)
    is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    sc_circle_ledger_id = Column(Integer, nullable=False)
    sc_circle_tx_id = Column(BigInteger, nullable=False)
    access_mask = Column(Integer, nullable=False)
    operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime)
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    sc_user_is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"))
    sc_user_ledger_id = Column(Integer)
    sc_user_tx_id = Column(BigInteger)
    sc_user_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    email_addr = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    phone = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    sc_user_access_mask = Column(Integer)
    sc_user_active_roles = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"))
    sc_user_active_roles_long = Column(Unicode(256, "SQL_Latin1_General_CP1_CI_AS"))
    sc_user_operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    sc_user_created_at = Column(DateTime)
    sc_user_username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    sc_group_is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"))
    sc_group_ledger_id = Column(Integer)
    sc_group_tx_id = Column(BigInteger)
    sc_group_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    sc_group_description = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    sc_group_operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    sc_group_created_at = Column(DateTime)
    sc_group_username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    active_roles = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"))
    active_roles_long = Column(Unicode(256, "SQL_Latin1_General_CP1_CI_AS"))


class FoodvibesScGroup(base):
    __tablename__ = "foodvibes_sc_group"
    ledger_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    sc_group_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    description = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    deleted = Column(Boolean)
    operation = Column(Integer, server_default=FetchedValue())
    created_at = Column(DateTime, server_default=FetchedValue())
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesScGroupLedgerView(base):
    __tablename__ = "foodvibes_sc_group_ledger_view"
    orm_id = Column(Integer, primary_key=True, nullable=False)
    is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    sc_group_ledger_id = Column(Integer, nullable=False)
    sc_group_tx_id = Column(BigInteger, nullable=False)
    sc_group_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    description = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime)
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)


class FoodvibesScUser(base):
    __tablename__ = "foodvibes_sc_user"
    ledger_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    sc_user_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    email_addr = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    phone = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    access_mask = Column(Integer, nullable=False)
    deleted = Column(Boolean)
    operation = Column(Integer, server_default=FetchedValue())
    created_at = Column(DateTime, server_default=FetchedValue())
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesScUserLedgerView(base):
    __tablename__ = "foodvibes_sc_user_ledger_view"
    orm_id = Column(Integer, primary_key=True, nullable=False)
    is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    sc_user_ledger_id = Column(Integer, nullable=False)
    sc_user_tx_id = Column(BigInteger, nullable=False)
    sc_user_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    email_addr = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    phone = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    access_mask = Column(Integer, nullable=False)
    active_roles = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"))
    active_roles_long = Column(Unicode(256, "SQL_Latin1_General_CP1_CI_AS"))
    operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime)
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)


class FoodvibesTrackingProducts(base):
    __tablename__ = "foodvibes_tracking_products"
    ledger_id = Column(Integer, primary_key=True, server_default=FetchedValue())
    geotrack_ledger_id = Column(Integer, nullable=False, index=True)
    geotrack_tx_id = Column(Integer, nullable=False)
    product_ledger_id = Column(Integer, nullable=False, index=True)
    product_tx_id = Column(Integer, nullable=False)
    product_aggregation = Column(Integer, nullable=False)
    notes = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    recorded_at = Column(DateTime)
    properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation = Column(Integer, server_default=FetchedValue())
    created_at = Column(DateTime, server_default=FetchedValue())
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    ledger_start_transaction_id = Column(BigInteger, nullable=False)
    ledger_end_transaction_id = Column(BigInteger)
    ledger_start_sequence_number = Column(BigInteger, nullable=False)
    ledger_end_sequence_number = Column(BigInteger)


class FoodvibesTrackingProductsLedgerView(base):
    __tablename__ = "foodvibes_tracking_products_ledger_view"
    orm_id = Column(Integer, primary_key=True, nullable=False)
    is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    tracking_products_ledger_id = Column(Integer, nullable=False)
    tracking_products_tx_id = Column(BigInteger, nullable=False)
    product_aggregation = Column(Integer, nullable=False)
    notes = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    recorded_at = Column(DateTime)
    properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    created_at = Column(DateTime)
    username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"), nullable=False)
    geotrack_is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"))
    geotrack_ledger_id = Column(Integer)
    geotrack_tx_id = Column(BigInteger)
    geotrack_id = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"))
    name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    details = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    latitude = Column(Float(53))
    longitude = Column(Float(53))
    geotrack_recorded_at = Column(DateTime)
    geotrack_properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    geotrack_operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    geotrack_image_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    geotrack_image_url = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    geotrack_created_at = Column(DateTime)
    geotrack_username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    product_is_history = Column(String(1, "SQL_Latin1_General_CP1_CI_AS"))
    product_ledger_id = Column(Integer)
    product_tx_id = Column(BigInteger)
    product_id = Column(Unicode(64, "SQL_Latin1_General_CP1_CI_AS"))
    description = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    quantity = Column(Integer)
    storage_tier = Column(Integer)
    product_recorded_at = Column(DateTime)
    product_properties = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    product_operation_name = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    product_image_id = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    product_image_url = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    product_created_at = Column(DateTime)
    product_username = Column(Unicode(collation="SQL_Latin1_General_CP1_CI_AS"))
    rank_curr_ledger_id = Column(BigInteger)
    prev_latitude = Column(Float(53))
    prev_longitude = Column(Float(53))
    prev_product_ledger_id = Column(Integer)
    geotrack_movement = Column(Integer, nullable=False)


class FoodvibesConstantsResponse(BaseModel):
    constant_id: int
    group_name: str
    constant_name: str
    constant_value: int
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesGeotrackResponse(BaseModel):
    ledger_id: int
    geotrack_id: str
    name: str
    details: str | None
    latitude: float
    longitude: float
    recorded_at: str | None
    properties: str | None
    operation: int | None
    image_id: str | None
    created_at: str | None
    username: str
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesGeotrackLedgerViewResponse(BaseModel):
    orm_id: int
    is_history: str
    geotrack_ledger_id: int
    geotrack_tx_id: int
    geotrack_id: str
    name: str
    details: str | None
    latitude: float
    longitude: float
    recorded_at: str | None
    properties: str | None
    operation_name: str | None
    image_id: str | None
    image_url: str | None
    created_at: str | None
    username: str


class FoodvibesProductResponse(BaseModel):
    ledger_id: int
    product_id: str
    description: str
    quantity: int
    storage_tier: int
    recorded_at: str | None
    properties: str | None
    operation: int | None
    image_id: str | None
    created_at: str | None
    username: str
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesProductLedgerViewResponse(BaseModel):
    orm_id: int
    is_history: str
    product_ledger_id: int
    product_tx_id: int
    product_id: str
    description: str
    quantity: int
    storage_tier: int
    recorded_at: str | None
    properties: str | None
    operation_name: str | None
    image_id: str | None
    image_url: str | None
    created_at: str | None
    username: str


class FoodvibesScCircleResponse(BaseModel):
    ledger_id: int
    sc_group_ledger_id: int
    sc_user_ledger_id: int
    access_mask: int
    deleted: bool
    operation: int | None
    created_at: str | None
    username: str
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesScCircleLedgerViewResponse(BaseModel):
    orm_id: int
    is_history: str
    sc_circle_ledger_id: int
    sc_circle_tx_id: int
    access_mask: int
    operation_name: str | None
    created_at: str | None
    username: str
    sc_user_is_history: str
    sc_user_ledger_id: int | None
    sc_user_tx_id: int | None
    sc_user_id: str | None
    email_addr: str | None
    phone: str | None
    sc_user_access_mask: int | None
    sc_user_active_roles: str | None
    sc_user_active_roles_long: str | None
    sc_user_operation_name: str | None
    sc_user_created_at: str | None
    sc_user_username: str | None
    sc_group_is_history: str
    sc_group_ledger_id: int | None
    sc_group_tx_id: int | None
    sc_group_id: str | None
    sc_group_description: str | None
    sc_group_operation_name: str | None
    sc_group_created_at: str | None
    sc_group_username: str | None
    active_roles: str | None
    active_roles_long: str | None


class FoodvibesScGroupResponse(BaseModel):
    ledger_id: int
    sc_group_id: str | None
    description: str | None
    deleted: bool
    operation: int | None
    created_at: str | None
    username: str
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesScGroupLedgerViewResponse(BaseModel):
    orm_id: int
    is_history: str
    sc_group_ledger_id: int
    sc_group_tx_id: int
    sc_group_id: str | None
    description: str | None
    operation_name: str | None
    created_at: str | None
    username: str


class FoodvibesScUserResponse(BaseModel):
    ledger_id: int
    sc_user_id: str
    email_addr: str | None
    phone: str | None
    access_mask: int
    deleted: bool
    operation: int | None
    created_at: str | None
    username: str
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesScUserLedgerViewResponse(BaseModel):
    orm_id: int
    is_history: str
    sc_user_ledger_id: int
    sc_user_tx_id: int
    sc_user_id: str
    email_addr: str | None
    phone: str | None
    access_mask: int
    active_roles: str | None
    active_roles_long: str | None
    operation_name: str | None
    created_at: str | None
    username: str


class FoodvibesTrackingProductsResponse(BaseModel):
    ledger_id: int
    geotrack_ledger_id: int
    geotrack_tx_id: int
    product_ledger_id: int
    product_tx_id: int
    product_aggregation: int
    notes: str | None
    recorded_at: str | None
    properties: str | None
    operation: int | None
    created_at: str | None
    username: str
    ledger_start_transaction_id: int
    ledger_end_transaction_id: int | None
    ledger_start_sequence_number: int
    ledger_end_sequence_number: int | None


class FoodvibesTrackingProductsLedgerViewResponse(BaseModel):
    orm_id: int
    is_history: str
    tracking_products_ledger_id: int
    tracking_products_tx_id: int
    product_aggregation: int
    notes: str | None
    recorded_at: str | None
    properties: str | None
    operation_name: str | None
    created_at: str | None
    username: str
    geotrack_is_history: str
    geotrack_ledger_id: int | None
    geotrack_tx_id: int | None
    geotrack_id: str | None
    name: str | None
    details: str | None
    latitude: float | None
    longitude: float | None
    geotrack_recorded_at: str | None
    geotrack_properties: str | None
    geotrack_operation_name: str | None
    geotrack_image_id: str | None
    geotrack_image_url: str | None
    geotrack_created_at: str | None
    geotrack_username: str | None
    product_is_history: str
    product_ledger_id: int | None
    product_tx_id: int | None
    product_id: str | None
    description: str | None
    quantity: int | None
    storage_tier: int | None
    product_recorded_at: str | None
    product_properties: str | None
    product_operation_name: str | None
    product_image_id: str | None
    product_image_url: str | None
    product_created_at: str | None
    product_username: str | None
    rank_curr_ledger_id: int | None
    prev_latitude: float | None
    prev_longitude: float | None
    prev_product_ledger_id: int | None
    geotrack_movement: int


class FoodvibesConstantsRequest(BaseModel):
    constant_id: int
    group_name: str
    constant_name: str
    constant_value: int


class FoodvibesGeotrackRequest(BaseModel):
    ledger_id: int
    geotrack_id: str
    name: str
    details: str | None
    latitude: float
    longitude: float
    recorded_at: str | None
    properties: str | None
    operation: int | None
    image_id: str | None
    created_at: str | None
    username: str


class FoodvibesGeotrackLedgerViewRequest(BaseModel):
    orm_id: int
    is_history: str
    geotrack_ledger_id: int
    geotrack_tx_id: int
    geotrack_id: str
    name: str
    details: str | None
    latitude: float
    longitude: float
    recorded_at: str | None
    properties: str | None
    image_id: str | None
    image_url: str | None
    created_at: str | None
    username: str


class FoodvibesProductRequest(BaseModel):
    ledger_id: int
    product_id: str
    description: str
    quantity: int
    storage_tier: int
    recorded_at: str | None
    properties: str | None
    operation: int | None
    image_id: str | None
    created_at: str | None
    username: str


class FoodvibesProductLedgerViewRequest(BaseModel):
    orm_id: int
    is_history: str
    product_ledger_id: int
    product_tx_id: int
    product_id: str
    description: str
    quantity: int
    storage_tier: int
    recorded_at: str | None
    properties: str | None
    image_id: str | None
    image_url: str | None
    created_at: str | None
    username: str


class FoodvibesScCircleRequest(BaseModel):
    ledger_id: int
    sc_group_ledger_id: int
    sc_user_ledger_id: int
    access_mask: int
    deleted: bool
    operation: int | None
    created_at: str | None
    username: str


class FoodvibesScCircleLedgerViewRequest(BaseModel):
    orm_id: int
    is_history: str
    sc_circle_ledger_id: int
    sc_circle_tx_id: int
    access_mask: int
    created_at: str | None
    username: str
    sc_user_is_history: str
    sc_user_ledger_id: int | None
    sc_user_tx_id: int | None
    sc_user_id: str | None
    email_addr: str | None
    phone: str | None
    sc_user_access_mask: int | None
    sc_user_active_roles: str | None
    sc_user_active_roles_long: str | None
    sc_user_operation_name: str | None
    sc_user_created_at: str | None
    sc_user_username: str | None
    sc_group_is_history: str
    sc_group_ledger_id: int | None
    sc_group_tx_id: int | None
    sc_group_id: str | None
    sc_group_description: str | None
    sc_group_operation_name: str | None
    sc_group_created_at: str | None
    sc_group_username: str | None
    active_roles: str | None
    active_roles_long: str | None


class FoodvibesScGroupRequest(BaseModel):
    ledger_id: int
    sc_group_id: str | None
    description: str | None
    deleted: bool
    operation: int | None
    created_at: str | None
    username: str


class FoodvibesScGroupLedgerViewRequest(BaseModel):
    orm_id: int
    is_history: str
    sc_group_ledger_id: int
    sc_group_tx_id: int
    sc_group_id: str | None
    description: str | None
    created_at: str | None
    username: str


class FoodvibesScUserRequest(BaseModel):
    ledger_id: int
    sc_user_id: str
    email_addr: str | None
    phone: str | None
    access_mask: int
    deleted: bool
    operation: int | None
    created_at: str | None
    username: str


class FoodvibesScUserLedgerViewRequest(BaseModel):
    orm_id: int
    is_history: str
    sc_user_ledger_id: int
    sc_user_tx_id: int
    sc_user_id: str
    email_addr: str | None
    phone: str | None
    access_mask: int
    active_roles: str | None
    active_roles_long: str | None
    created_at: str | None
    username: str


class FoodvibesTrackingProductsRequest(BaseModel):
    ledger_id: int
    geotrack_ledger_id: int
    geotrack_tx_id: int
    product_ledger_id: int
    product_tx_id: int
    product_aggregation: int
    notes: str | None
    recorded_at: str | None
    properties: str | None
    operation: int | None
    created_at: str | None
    username: str


class FoodvibesTrackingProductsLedgerViewRequest(BaseModel):
    orm_id: int
    is_history: str
    tracking_products_ledger_id: int
    tracking_products_tx_id: int
    product_aggregation: int
    notes: str | None
    recorded_at: str | None
    properties: str | None
    created_at: str | None
    username: str
    geotrack_is_history: str
    geotrack_ledger_id: int | None
    geotrack_tx_id: int | None
    geotrack_id: str | None
    name: str | None
    details: str | None
    latitude: float | None
    longitude: float | None
    geotrack_recorded_at: str | None
    geotrack_properties: str | None
    geotrack_operation_name: str | None
    geotrack_image_id: str | None
    geotrack_image_url: str | None
    geotrack_created_at: str | None
    geotrack_username: str | None
    product_is_history: str
    product_ledger_id: int | None
    product_tx_id: int | None
    product_id: str | None
    description: str | None
    quantity: int | None
    storage_tier: int | None
    product_recorded_at: str | None
    product_properties: str | None
    product_operation_name: str | None
    product_image_id: str | None
    product_image_url: str | None
    product_created_at: str | None
    product_username: str | None
    rank_curr_ledger_id: int | None
    prev_latitude: float | None
    prev_longitude: float | None
    prev_product_ledger_id: int | None
    geotrack_movement: int


class FarmVibesForestRequest(BaseModel):
    id: str
    forest_year: int
    contour: bool
    color: str
    geojson: dict[str, Any]
