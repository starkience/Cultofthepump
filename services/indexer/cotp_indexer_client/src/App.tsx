import { useEffect, useState } from 'react';
import './App.css';
import { createClient, type token as Token } from './client';
import { TradeFeed } from './components/TradeFeed';
import { truncateAddress } from './utils';
import { INDEXER_GRAPHQL_URL } from './config';

const client = createClient({
  url: INDEXER_GRAPHQL_URL,
  headers: {},
});

function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await client.query({
          token: {
            id: true,
            name: true,
            symbol: true,
            contractAddress: true,
            initialSupply: true,
            initialPrice: true,
            numHolders: true,
            createdBy: true,
            launchFee: true,
            __typename: true,
          }
        });

        setTokens(response.token);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      <main>
        <div className="token-grid">
          {filteredTokens.map((token) => (
            <div key={token.id} className="token-card">
              <div className="token-image">
                <img 
                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${token.name}`} 
                  alt={token.name}
                />
              </div>
              <div className="token-content">
                <h2>{token.name}</h2>
                <div className="token-symbol">${token.symbol}</div>
                <div className="token-info">
                  <div className="info-row">
                    <span className="label">Created by:</span>
                    <a 
                      href={`https://sepolia.voyager.online/contract/${token.createdBy}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="address-link"
                    >
                      {truncateAddress(token.createdBy)}
                    </a>
                  </div>
                  <div className="info-row">
                    <span className="label">Holders:</span>
                    <span className="value">{token.numHolders}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <TradeFeed />
    </div>
  );
}

export default App;
