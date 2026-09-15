import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, NavLink } from '@/lib/ui/Nav';
import { Container } from '@/lib/ui/Container';
import { Activity, LayoutDashboard, Star } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import CoinDetailPage from '@/pages/CoinDetail';
import WatchlistPage from '@/pages/Watchlist';
import { SearchBar } from '@/components/SearchBar';
import { AuthPanel } from '@/components/AuthPanel';

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Nav
        brand={
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <Activity size={18} />
            <span>Market Pulse</span>
          </Link>
        }
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            <AuthPanel />
          </div>
        }
      >
        <NavLink href="#" active={location.pathname === '/'} onClick={() => navigate('/')}>
          <LayoutDashboard size={14} className="mr-2" /> Markets
        </NavLink>
        <NavLink href="#" active={location.pathname === '/watchlist'} onClick={() => navigate('/watchlist')}>
          <Star size={14} className="mr-2" /> Watchlist
        </NavLink>
      </Nav>
      <main className="py-8">
        <Container>
          <div className="mb-6 sm:hidden">
            <SearchBar />
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/coin/:id" element={<CoinDetailPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
          </Routes>
        </Container>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
