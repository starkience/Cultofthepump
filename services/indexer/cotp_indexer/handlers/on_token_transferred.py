from cotp_indexer import models as models
from cotp_indexer.types.token.starknet_events.transfer import TransferPayload
from dipdup.context import HandlerContext
from dipdup.models.starknet import StarknetEvent


async def on_token_transferred(
    ctx: HandlerContext,
    event: StarknetEvent[TransferPayload],
) -> None:
    ctx.logger.info(f"on_token_transferred: {event.payload.value} ({event.data.from_address[-8]})")
