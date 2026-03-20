from cotp_indexer import models as models
from cotp_indexer.types.swap.starknet_events.pool_launched import PoolLaunchedPayload
from dipdup.context import HandlerContext
from dipdup.models.starknet import StarknetEvent


async def on_pool_launched(
    ctx: HandlerContext,
    event: StarknetEvent[PoolLaunchedPayload],
) -> None:
    ...