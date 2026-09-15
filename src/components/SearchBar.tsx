import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchCoins } from '@/lib/coingecko';
import { Input } from '@/lib/ui/Input';
import { Spinner } from '@/lib/ui/Spinner';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchCoins(query),
    enabled: query.trim().length > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search coins…"
          className="pl-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && query.trim().length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-surface-elevated shadow-elev-3">
          {isFetching ? (
            <div className="flex items-center gap-2 px-4 py-3 text-small text-muted-foreground">
              <Spinner size={14} /> Searching…
            </div>
          ) : !data || data.length === 0 ? (
            <div className="px-4 py-3 text-small text-muted-foreground">No coins found.</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {data.map((coin) => (
                <li key={coin.id}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/coin/${coin.id}`);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-small transition-colors hover:bg-muted"
                  >
                    <img src={coin.thumb} alt="" className="h-5 w-5 rounded-full" />
                    <span className="flex-1 truncate">{coin.name}</span>
                    <span className="uppercase text-muted-foreground">{coin.symbol}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
