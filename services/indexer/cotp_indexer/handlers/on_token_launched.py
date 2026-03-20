from decimal import Decimal

from cotp_indexer import models as models
from cotp_indexer.types.factory.starknet_events.shitcoin_launched import ShitcoinLaunchedPayload
from dipdup.context import HandlerContext
from dipdup.models.starknet import StarknetEvent


async def on_token_launched(
    ctx: HandlerContext,
    event: StarknetEvent[ShitcoinLaunchedPayload],
) -> None:
    token_name = event.payload.name
    token_symbol = event.payload.symbol
    token_address = hex(event.payload.shitcoin_address)
    
    contract_name = f'token_{token_symbol.lower()}_{token_address[-8:]}'
    await ctx.add_contract(name=contract_name, kind='starknet', address=token_address, typename='token')
    
    index_name = f'{contract_name}_index'
    await ctx.add_index(name=index_name, template='token_events', values={'contract': contract_name, 'first_level': 300000})
    
    ctx.logger.info(f"on_token_launched: {token_name}, symbol {token_symbol} ({token_address[-8:]})")

    token = models.Token(
        id=Decimal(event.payload.shitcoin_address),
        created_by=hex(event.payload.creator),
        name=token_name,
        symbol=token_symbol,
        initial_supply=Decimal(event.payload.pile_of_shit),
        initial_price=Decimal(event.payload.initial_shniping),
        contract_address=token_address,
        launch_fee=Decimal(event.payload.fees_paid),
    )
    await token.save()
