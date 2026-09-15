const BASE = 'https://api.coingecko.com/api/v3';

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  price_change_percentage_24h: number | null;
}

export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    ath: { usd: number };
  };
}

export interface MarketChart {
  prices: [number, number][];
}

async function cgFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('CoinGecko rate limit reached. Wait a moment and try again.');
    }
    throw new Error(`CoinGecko request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function getMarkets(page = 1, perPage = 50): Promise<MarketCoin[]> {
  return cgFetch<MarketCoin[]>(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
  );
}

export async function getMarketsByIds(ids: string[]): Promise<MarketCoin[]> {
  if (ids.length === 0) return [];
  return cgFetch<MarketCoin[]>(
    `/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(','))}&order=market_cap_desc&price_change_percentage=24h&sparkline=false`
  );
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
  if (!query.trim()) return [];
  const data = await cgFetch<{ coins: SearchCoin[] }>(`/search?query=${encodeURIComponent(query.trim())}`);
  return data.coins.slice(0, 8);
}

export async function getCoinDetail(id: string): Promise<CoinDetail> {
  return cgFetch<CoinDetail>(
    `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  );
}

export async function getMarketChart(id: string, days = 7): Promise<MarketChart> {
  return cgFetch<MarketChart>(`/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const fractionDigits = value < 1 ? 6 : value < 10 ? 4 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
