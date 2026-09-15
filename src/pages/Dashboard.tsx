import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarkets } from '@/lib/coingecko';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/ui/Card';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Button } from '@/lib/ui/Button';
import { CoinRow } from '@/components/CoinRow';
import { Coins } from 'lucide-react';

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['markets', page],
    queryFn: () => getMarkets(page, 50),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-display">Markets</h1>
        <p className="max-w-2xl text-body text-muted-foreground">
          Live prices, market caps, and 24-hour moves for the top coins by market cap, sourced directly from
          CoinGecko.
        </p>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Top coins</CardTitle>
          <CardDescription>Ranked by market capitalization, updated live.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12">
              <CenteredSpinner label="Loading markets" />
            </div>
          ) : error ? (
            <div className="px-6 pb-6">
              <Alert variant="destructive">
                <AlertTitle>Couldn't load markets</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <span>{(error as Error).message}</span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState
                icon={<Coins size={20} />}
                title="No coins found"
                description="CoinGecko returned no data. Try again shortly."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((coin) => (
                <CoinRow key={coin.id} coin={coin} />
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-small tabular-nums text-muted-foreground">
            Page {page}
            {isFetching ? ' · updating…' : ''}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
