import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { useWatchlistQuery, useRemoveFromWatchlist } from '@/lib/watchlist';
import { getMarketsByIds, formatCurrency, formatPercent } from '@/lib/coingecko';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Badge } from '@/lib/ui/Badge';
import { Button } from '@/lib/ui/Button';
import { Star, X, LogIn } from 'lucide-react';
import { AuthPanel } from '@/components/AuthPanel';

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const watchlistQuery = useWatchlistQuery(user?.id);
  const remove = useRemoveFromWatchlist(user?.id);

  const ids = watchlistQuery.data?.map((w) => w.coin_id) ?? [];
  const pricesQuery = useQuery({
    queryKey: ['watchlist-prices', ids],
    queryFn: () => getMarketsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 30_000,
  });

  if (authLoading) {
    return (
      <div className="py-24">
        <CenteredSpinner label="Checking session" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<LogIn size={20} />}
            title="Sign in to see your watchlist"
            description="Save coins from the dashboard or a detail page, then sign in to track them here."
            action={<AuthPanel />}
          />
        </CardContent>
      </Card>
    );
  }

  const priceMap = new Map(pricesQuery.data?.map((c) => [c.id, c]));

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-display">Watchlist</h1>
        <p className="max-w-2xl text-body text-muted-foreground">
          Coins you're tracking, with live prices refreshed from CoinGecko.
        </p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Saved coins</CardTitle>
          <CardDescription>{ids.length} coin{ids.length === 1 ? '' : 's'} saved.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {watchlistQuery.isLoading ? (
            <div className="py-12">
              <CenteredSpinner label="Loading watchlist" />
            </div>
          ) : watchlistQuery.error ? (
            <div className="px-6 pb-6">
              <Alert variant="destructive">
                <AlertTitle>Couldn't load watchlist</AlertTitle>
                <AlertDescription>{(watchlistQuery.error as Error).message}</AlertDescription>
              </Alert>
            </div>
          ) : !watchlistQuery.data || watchlistQuery.data.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState
                icon={<Star size={20} />}
                title="Nothing saved yet"
                description="Add coins to your watchlist from the markets page or a coin's detail view."
              />
            </div>
          ) : pricesQuery.isLoading ? (
            <div className="py-12">
              <CenteredSpinner label="Fetching live prices" />
            </div>
          ) : pricesQuery.error ? (
            <div className="px-6 pb-6">
              <Alert variant="destructive">
                <AlertTitle>Couldn't load prices</AlertTitle>
                <AlertDescription>{(pricesQuery.error as Error).message}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {watchlistQuery.data.map((item) => {
                const live = priceMap.get(item.coin_id);
                const change = live?.price_change_percentage_24h ?? null;
                const positive = (change ?? 0) >= 0;
                return (
                  <li key={item.id} className="flex items-center gap-4 px-6 py-3">
                    {live?.image && <img src={live.image} alt="" className="h-8 w-8 rounded-full" />}
                    <Link to={`/coin/${item.coin_id}`} className="flex-1 transition-colors hover:text-foreground">
                      <div className="text-body">{item.name}</div>
                      <div className="text-small uppercase text-muted-foreground">{item.symbol}</div>
                    </Link>
                    <span className="text-body tabular-nums">{formatCurrency(live?.current_price)}</span>
                    <Badge variant={positive ? 'success' : 'destructive'}>{formatPercent(change)}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${item.name} from watchlist`}
                      onClick={() => remove.mutate(item.coin_id)}
                      disabled={remove.isPending}
                    >
                      <X size={16} />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
