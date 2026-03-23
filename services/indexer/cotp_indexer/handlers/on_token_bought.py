from datetime import datetime, timezone
from decimal import Decimal

from cotp_indexer import models as models
from cotp_indexer.types.swap.starknet_events.token_bought import TokenBoughtPayload
from dipdup.context import HandlerContext
from dipdup.models.starknet import StarknetEvent


async def on_token_bought(
    ctx: HandlerContext,
    event: StarknetEvent[TokenBoughtPayload],
) -> None:
    ctx.logger.info(f"on_token_bought: {event.payload.token_amount} for {event.payload.strk_amount} STRK ({hex(event.payload.token)[-8:]})")

    trade = models.Trade(
        side=models.TradeSide.BUY,
        kind=models.TradeKind.PRE_MARKET,
        token_qty=Decimal(event.payload.token_amount),
        strk_qty=Decimal(event.payload.strk_amount),
        market_cap=Decimal(event.payload.market_cap),
        block_number=event.data.level,
        timestamp=datetime.fromtimestamp(event.data.timestamp, tz=timezone.utc) if event.data.timestamp else None,
        token_id=Decimal(event.payload.token),
        trader_id=Decimal(event.payload.buyer),
    )
    await trade.save()
