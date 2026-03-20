import { useEffect, useState } from 'react';
import { createClient } from 'graphql-ws';
import { generateSubscriptionOp, type trade as Trade } from '../client';
import './TradeFeed.css';
import { truncateAddress, toHexString } from '../utils';

const wsClient = createClient({
  url: 'ws://localhost:8080/v1/graphql',  // adjust to your WS endpoint
});

export function TradeFeed() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const { query } = generateSubscriptionOp({
      trade: {
        id: true,
        side: true,
        kind: true,
        strkQty: true,
        tokenQty: true,
        tokenId: true,
        token: {
          symbol: true,
          name: true,
        },
      },
    });

    const unsubscribe = wsClient.subscribe(
      { query },
      {
        next: (data: any) => {
          if (data?.data?.trade) {
            setTrades(prevTrades => {
              const newTrades = [...data.data.trade, ...prevTrades].slice(0, 10);
              return newTrades;
            });
          }
        },
        error: console.error,
        complete: () => console.log('Trade subscription completed'),
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="trade-feed">
      <div className="trade-feed-header">
        <h2>LIVE TRADES</h2>
        <div className="signal-indicator">●</div>
      </div>
      <div className="trade-list">
        {trades.map((trade) => (
          <div 
            key={trade.id} 
            className={`trade-item ${trade.side === 0 ? 'buy' : 'sell'} new-trade`}
          >
            <div className="trade-symbol">
              {trade.token ? 
                `$${trade.token.symbol}` : 
                truncateAddress(toHexString(trade.tokenId))
              }
            </div>
            <div className="trade-details">
              <span className="trade-type">
                {trade.kind === 0 ? 'PRE-MARKET' : 'EKUBO-POOL'}
              </span>
              <span className="trade-side">
                {trade.side === 0 ? 'BUY' : 'SELL'}
              </span>
              <span className="trade-amount">
                {trade.tokenQty} {trade.token ? 
                trade.token.symbol : ""} @ {trade.strkQty} STRK
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 