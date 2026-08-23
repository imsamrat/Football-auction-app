import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Gavel, Trophy, Settings,
  Radio, LogOut, ChevronLeft, UserCheck, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import seasonService from '../services/auctionSeasonService';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSeason, setActiveSeason] = useState(null);

  useEffect(() => {
    const fetchActiveSeason = async () => {
      try {
        const season = await seasonService.getActiveSeason();
        setActiveSeason(season);
      } catch (err) {
        console.error('Failed to fetch active season:', err);
      }
    };
    fetchActiveSeason();
  }, [location.pathname]); // Refetch on navigation just in case it changed

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/players', label: 'Players', icon: Users },
    { to: '/admin/bidders', label: 'Bidders', icon: UserCheck },
    { to: '/admin/auction', label: 'Auction', icon: Radio },
    { to: '/admin/results', label: 'Results', icon: Trophy },
    { to: '/admin/seasons', label: 'Seasons', icon: Calendar },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-100 border-r border-dark-50/50 flex flex-col sticky top-0 h-screen hidden lg:flex">
        {/* Logo */}
        <div className="p-4 border-b border-dark-50/50">
          <Link to="/" className="flex items-center gap-3 group mb-4">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white">Admin</span>
              <span className="font-display font-bold text-primary"> Panel</span>
            </div>
          </Link>

          {activeSeason && (
            <div className="px-3 py-2 bg-dark-200/50 rounded-xl border border-dark-50/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active Season</div>
                <div className="text-sm font-medium text-white truncate" title={activeSeason.name}>{activeSeason.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-400 hover:text-white hover:bg-dark-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-dark-50/50 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-200 transition-all">
            <ChevronLeft className="w-5 h-5" />
            Back to Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-dark-200 transition-all">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-40 bg-dark-100/90 backdrop-blur-xl border-b border-dark-50/50 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm">Admin</span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map(({ to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`p-2 rounded-lg ${location.pathname === to ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
