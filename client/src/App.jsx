import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AuctionProvider } from './context/AuctionContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import AuctionArena from './pages/AuctionArena';
import PlayersPage from './pages/PlayersPage';
import ResultsPage from './pages/ResultsPage';

// Auth pages
import AdminLogin from './pages/AdminLogin';
import BidderLogin from './pages/BidderLogin';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminPlayers from './pages/AdminPlayers';
import AdminBidders from './pages/AdminBidders';
import AdminAuction from './pages/AdminAuction';
import AdminResults from './pages/AdminResults';
import AdminSettings from './pages/AdminSettings';

// Bidder pages
import BidderDashboard from './pages/BidderDashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AuctionProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/auction" element={<AuctionArena />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Route>

              {/* Auth routes (no layout) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/bidder/login" element={<BidderLogin />} />

              {/* Admin routes */}
              <Route element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/players" element={<AdminPlayers />} />
                <Route path="/admin/bidders" element={<AdminBidders />} />
                <Route path="/admin/auction" element={<AdminAuction />} />
                <Route path="/admin/results" element={<AdminResults />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* Bidder routes */}
              <Route path="/bidder/dashboard" element={
                <ProtectedRoute role="bidder">
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<BidderDashboard />} />
              </Route>
            </Routes>
          </Router>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E1E1E',
                color: '#FFFFFF',
                border: '1px solid #2A2A2A',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#4ADE80', secondary: '#1E1E1E' },
              },
              error: {
                iconTheme: { primary: '#E5232A', secondary: '#1E1E1E' },
              },
            }}
          />
        </AuctionProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
