from decimal import Decimal

from cotp_indexer import models as models
from cotp_indexer.types.swap.starknet_events.strk_price_updated import StrkPriceUpdatedPayload
from dipdup.context import HandlerContext
from dipdup.models.starknet import StarknetEvent


async def on_strk_price_updated(
    ctx: HandlerContext,
    event: StarknetEvent[StrkPriceUpdatedPayload],
) -> None:
    ...
    # Happens only once, upon token launch?
