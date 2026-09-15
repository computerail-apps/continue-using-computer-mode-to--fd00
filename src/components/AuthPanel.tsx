import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/lib/ui/Button';
import { Input } from '@/lib/ui/Input';
import { LogIn, LogOut } from 'lucide-react';

export function AuthPanel() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return null;

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => supabase.auth.signOut()}
        aria-label="Sign out"
      >
        <LogOut size={14} />
        <span className="hidden md:inline">Sign out</span>
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fn = mode === 'sign_in' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
      const { error } = await fn({ email, password });
      if (error) throw error;
      setOpen(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <LogIn size={14} />
        <span className="hidden md:inline">Sign in</span>
      </Button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-border bg-surface-elevated p-4 shadow-elev-3">
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="text-small text-destructive">{error}</p>}
            <Button type="submit" size="sm" className="w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
            </Button>
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'sign_in' ? 'sign_up' : 'sign_in'))}
              className="w-full text-center text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              {mode === 'sign_in' ? "Need an account? Sign up" : 'Have an account? Sign in'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
