import { useAuth } from '@/lib/useAuth';
import { useWatchlistQuery, useAddToWatchlist, useRemoveFromWatchlist } from '@/lib/watchlist';
import { Button } from '@/lib/ui/Button';
import { Star } from 'lucide-react';

interface Props {
  coinId: string;
  symbol: string;
  name: string;
  variant?: 'icon' | 'full';
}

export function WatchlistButton({ coinId, symbol, name, variant = 'full' }: Props) {
  const { user } = useAuth();
  const watchlistQuery = useWatchlistQuery(user?.id);
  const add = useAddToWatchlist(user?.id);
  const remove = useRemoveFromWatchlist(user?.id);

  const saved = watchlistQuery.data?.some((w) => w.coin_id === coinId) ?? false;
  const busy = add.isPending || remove.isPending;

  function toggle() {
    if (!user) return;
    if (saved) {
      remove.mutate(coinId);
    } else {
      add.mutate({ coin_id: coinId, symbol, name });
    }
  }

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={!user || busy}
        title={user ? (saved ? 'Remove from watchlist' : 'Add to watchlist') : 'Sign in to save coins'}
        aria-label={saved ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
        onClick={toggle}
      >
        <Star size={16} className={saved ? 'fill-warning text-warning' : ''} />
      </Button>
    );
  }

  return (
    <Button
      variant={saved ? 'outline' : 'primary'}
      disabled={!user || busy}
      onClick={toggle}
      title={!user ? 'Sign in to save coins' : undefined}
    >
      <Star size={16} className={saved ? 'fill-warning text-warning' : ''} />
      {saved ? 'In watchlist' : 'Add to watchlist'}
    </Button>
  );
}
