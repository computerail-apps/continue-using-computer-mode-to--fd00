import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCoinDetail, getMarketChart, formatCurrency, formatCompact, formatPercent } from '@/lib/coingecko';
import { PriceChart } from '@/components/PriceChart';
import { WatchlistButton } from '@/components/WatchlistButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Button } from '@/lib/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>();

  const detailQuery = useQuery({
    queryKey: ['coin', id],
    queryFn: () => getCoinDetail(id as string),
    enabled: !!id,
    staleTime: 60_000,
  });

  const chartQuery = useQuery({
    queryKey: ['coin-chart', id],
    queryFn: () => getMarketChart(id as string, 7),
    enabled: !!id,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-small text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to markets
      </Link>

      {detailQuery.isLoading ? (
        <div className="py-24">
          <CenteredSpinner label="Loading coin" />
        </div>
      ) : detailQuery.error || !detailQuery.data ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load coin</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{(detailQuery.error as Error)?.message ?? 'Unknown error'}</span>
            <Button size="sm" variant="outline" onClick={() => detailQuery.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {(() => {
            const coin = detailQuery.data!;
            const md = coin.market_data;
            const change = md.price_change_percentage_24h;
            const positive = (change ?? 0) >= 0;
            return (
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={coin.image.large} alt="" className="h-14 w-14 rounded-full" />
                  <div>
                    <h1 className="text-h1">
                      {coin.name} <span className="uppercase text-muted-foreground">{coin.symbol}</span>
                    </h1>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-h2 tabular-nums">{formatCurrency(md.current_price.usd)}</span>
                      <Badge variant={positive ? 'success' : 'destructive'}>{formatPercent(change)}</Badge>
                    </div>
                  </div>
                </div>
                <WatchlistButton coinId={coin.id} symbol={coin.symbol} name={coin.name} variant="full" />
              </div>
            );
          })()}

          <Card>
            <CardHeader>
              <CardTitle>7-day price</CardTitle>
              <CardDescription>USD price history over the last week.</CardDescription>
            </CardHeader>
            <CardContent>
              {chartQuery.isLoading ? (
                <div className="py-12">
                  <CenteredSpinner label="Loading chart" />
                </div>
              ) : chartQuery.error || !chartQuery.data ? (
                <Alert variant="destructive">
                  <AlertTitle>Couldn't load chart</AlertTitle>
                  <AlertDescription>{(chartQuery.error as Error)?.message ?? 'Unknown error'}</AlertDescription>
                </Alert>
              ) : (
                <PriceChart prices={chartQuery.data.prices} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(() => {
                const coin = detailQuery.data!;
                const md = coin.market_data;
                return (
                  <>
                    <Stat label="Market cap" value={formatCompact(md.market_cap.usd)} />
                    <Stat label="24h volume" value={formatCompact(md.total_volume.usd)} />
                    <Stat label="24h high" value={formatCurrency(md.high_24h.usd)} />
                    <Stat label="24h low" value={formatCurrency(md.low_24h.usd)} />
                    <Stat label="Circulating supply" value={formatCompact(md.circulating_supply)} />
                    <Stat label="All-time high" value={formatCurrency(md.ath.usd)} />
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-small text-muted-foreground">{label}</div>
      <div className="text-body tabular-nums">{value}</div>
    </div>
  );
}
