import { Link } from 'react-router-dom';
import type { MarketCoin } from '@/lib/coingecko';
import { formatCurrency, formatCompact, formatPercent } from '@/lib/coingecko';
import { Badge } from '@/lib/ui/Badge';
import { WatchlistButton } from './WatchlistButton';

export function CoinRow({ coin }: { coin: MarketCoin }) {
  const positive = (coin.price_change_percentage_24h ?? 0) >= 0;
  return (
    <li className="flex items-center gap-4 px-6 py-3">
      <span className="w-6 shrink-0 text-small tabular-nums text-muted-foreground">
        {coin.market_cap_rank ?? '—'}
      </span>
      <img src={coin.image} alt="" className="h-8 w-8 shrink-0 rounded-full" />
      <Link to={`/coin/${coin.id}`} className="min-w-0 flex-1 transition-colors hover:text-foreground">
        <div className="truncate text-body">{coin.name}</div>
        <div className="text-small uppercase text-muted-foreground">{coin.symbol}</div>
      </Link>
      <span className="hidden text-small tabular-nums text-muted-foreground sm:block">
        {formatCompact(coin.market_cap)}
      </span>
      <span className="w-24 shrink-0 text-right text-body tabular-nums">{formatCurrency(coin.current_price)}</span>
      <Badge variant={positive ? 'success' : 'destructive'} className="w-20 shrink-0 justify-center">
        {formatPercent(coin.price_change_percentage_24h)}
      </Badge>
      <div className="shrink-0">
        <WatchlistButton coinId={coin.id} symbol={coin.symbol} name={coin.name} variant="icon" />
      </div>
    </li>
  );
}
