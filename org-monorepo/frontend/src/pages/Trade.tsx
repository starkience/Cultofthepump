// src/pages/Trade.tsx
import { useState } from "react";
import { TrendingUp, Clock, Star, Search } from "lucide-react";

const MOCK_TOKENS = [
  {
    id: "1",
    name: "LeftCurve",
    symbol: "LEFT",
    price: 0.00001234,
    change24h: 125.34,
    marketCap: 1234567,
    volume24h: 345678,
  },
  {
    id: "2",
    name: "Pepe 3.0",
    symbol: "PEPE3",
    price: 0.00000789,
    change24h: -15.34,
    marketCap: 987654,
    volume24h: 123456,
  },
  // Add more mock tokens...
];

export default function Trade() {
  const [selectedTab, setSelectedTab] = useState("trending");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">Trade</h1>
          <p className="mt-2 text-gray-400">
            Discover and trade the hottest memecoins
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search tokens..."
            className="pl-10 pr-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Trading Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedTab("trending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            selectedTab === "trending"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <TrendingUp size={20} />
          Trending
        </button>
        <button
          onClick={() => setSelectedTab("recent")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            selectedTab === "recent"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Clock size={20} />
          Recently Added
        </button>
        <button
          onClick={() => setSelectedTab("watchlist")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            selectedTab === "watchlist"
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Star size={20} />
          Watchlist
        </button>
      </div>

      {/* Token List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                24h %
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Volume (24h)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {MOCK_TOKENS.map((token) => (
              <tr key={token.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {token.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                  ${token.price.toFixed(8)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                    token.change24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {token.change24h > 0 ? "+" : ""}
                  {token.change24h.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                  ${token.marketCap.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                  ${token.volume24h.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button className="bg-primary hover:bg-primary-dark text-white px-4 py-1 rounded">
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
