import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

export interface WatchlistItem {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  created_at: string;
}

const TABLE = 'continue_using_compu_watchlist_items';

export function useWatchlistQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['watchlist', userId],
    queryFn: async (): Promise<WatchlistItem[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('id,coin_id,symbol,name,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useAddToWatchlist(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coin: { coin_id: string; symbol: string; name: string }) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase.from(TABLE).insert({
        user_id: userId,
        coin_id: coin.coin_id,
        symbol: coin.symbol,
        name: coin.name,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist', userId] }),
  });
}

export function useRemoveFromWatchlist(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coinId: string) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase.from(TABLE).delete().eq('user_id', userId).eq('coin_id', coinId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist', userId] }),
  });
}
