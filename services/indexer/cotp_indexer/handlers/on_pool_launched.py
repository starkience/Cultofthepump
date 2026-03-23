from decimal import Decimal

from cotp_indexer import models as models
from cotp_indexer.types.swap.starknet_events.pool_launched import PoolLaunchedPayload
from dipdup.context import HandlerContext
from dipdup.models.starknet import StarknetEvent


async def on_pool_launched(
    ctx: HandlerContext,
    event: StarknetEvent[PoolLaunchedPayload],
) -> None:
    token_address = hex(event.payload.token)
    ctx.logger.info(f"on_pool_launched: {token_address[-8:]} graduated to Ekubo DEX")

    token_id = Decimal(event.payload.token)
    token = await models.Token.get_or_none(id=token_id)
    if token:
        token.graduated = True
        await token.save()
    else:
        ctx.logger.warning(f"on_pool_launched: token {token_address} not found in DB")
