from enum import IntEnum

from dipdup import fields
from dipdup.models import Model


class Token(Model):
    id = fields.DecimalField(primary_key=True, max_digits=80, decimal_places=0)
    created_by = fields.TextField(max_length=66)
    name = fields.TextField(max_length=31)
    symbol = fields.TextField(max_length=31)
    initial_supply = fields.DecimalField(max_digits=80, decimal_places=0)
    initial_price = fields.DecimalField(max_digits=80, decimal_places=0)
    launch_fee = fields.DecimalField(max_digits=80, decimal_places=0)
    contract_address = fields.TextField(max_length=66)
    num_holders = fields.IntField(default=0)


class Holder(Model):
    id = fields.DecimalField(primary_key=True, max_digits=80, decimal_places=0)
    contract_address = fields.TextField(max_length=66)
    num_tokens = fields.IntField(default=0)


class Position(Model):
    id = fields.BigIntField(primary_key=True)
    balance = fields.DecimalField(max_digits=80, decimal_places=0, default=0)

    holder: fields.ForeignKeyFieldInstance[Holder] = fields.ForeignKeyField(
        model_name='models.Holder',
        source_field='holder_id',
        to_field='id',
    )

    token: fields.ForeignKeyFieldInstance[Token] = fields.ForeignKeyField(
        model_name='models.Token',
        source_field='token_id',
        to_field='id',
    )


class TradeSide(IntEnum):
    BUY = 0
    SELL = 1


class TradeKind(IntEnum):
    PRE_MARKET = 0
    EKUBO_POOL = 1


class Trade(Model):
    id = fields.BigIntField(primary_key=True)
    side = fields.IntEnumField(enum_type=TradeSide)
    kind = fields.IntEnumField(enum_type=TradeKind)
    token_qty = fields.DecimalField(max_digits=80, decimal_places=0)
    strk_qty = fields.DecimalField(max_digits=80, decimal_places=0)

    token_id = fields.DecimalField(max_digits=80, decimal_places=0)
    trader_id = fields.DecimalField(max_digits=80, decimal_places=0)
