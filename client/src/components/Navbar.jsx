import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Radio, Users, Trophy, LogIn, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isBidder, logout } = useAuth();
  const { connected } = useSocket();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const publicLinks = [
    { to: '/', label: 'Home', icon: Gavel },
    { to: '/auction', label: 'Live Auction', icon: Radio },
    { to: '/players', label: 'Players', icon: Users },
    { to: '/results', label: 'Results', icon: Trophy },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-dark-100/90 backdrop-blur-xl border-b border-dark-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-white">Auction</span>
              <span className="font-display font-bold text-lg text-primary">Arena</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-400 hover:text-white hover:bg-dark-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-dark-200 text-xs">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
              <span className={connected ? 'text-green-400' : 'text-red-400'}>
                {connected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-200 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                {isBidder && (
                  <Link
                    to="/bidder/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-200 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-200 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {user?.name?.[0] || user?.username?.[0] || '?'}
                  </div>
                  <span className="text-gray-300">{user?.name || user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-dark-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-200 transition-all"
                >
                  Admin
                </Link>
                <Link
                  to="/bidder/login"
                  className="btn-primary text-sm !px-4 !py-2 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Bid Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {publicLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              location.pathname === to
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navbar;
