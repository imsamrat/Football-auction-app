import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import { getPlayers } from '../services/playerService';
import { formatCurrency, getPositionColor, getStatusBadge, getPlayerInitials } from '../utils/helpers';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = async () => {
    try {
      const { data } = await getPlayers();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = ['ALL', 'UPCOMING', 'SOLD', 'UNSOLD'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Player Roster
        </h1>
        <p className="text-gray-400 mt-1">{players.length} registered players</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search players..." />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Player cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((player, i) => (
          <motion.div
            key={player._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card overflow-hidden hover:border-primary/30 transition-colors"
          >
            <div className="h-1 bg-gradient-to-r from-primary to-red-400" />
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-dark-300 flex items-center justify-center">
                  <span className="text-xl font-display font-bold text-white/80">
                    {getPlayerInitials(player.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-display font-bold text-primary">#{player.playerNumber}</span>
                    <span className={getStatusBadge(player.status)}>{player.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white truncate">{player.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${getPositionColor(player.position)}`}>{player.position}</span>
                    <span className="text-xs text-gray-500">{player.division}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Base Price</span>
                <span className="text-lg font-display font-bold text-white">{formatCurrency(player.basePrice)}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3">
                <div className="text-center bg-dark-200/50 rounded-lg py-2">
                  <p className="text-sm font-bold text-white">{player.matches}</p>
                  <p className="text-[9px] text-gray-500">MAT</p>
                </div>
                <div className="text-center bg-dark-200/50 rounded-lg py-2">
                  <p className="text-sm font-bold text-white">{player.goals}</p>
                  <p className="text-[9px] text-gray-500">GOL</p>
                </div>
                <div className="text-center bg-dark-200/50 rounded-lg py-2">
                  <p className="text-sm font-bold text-white">{player.assists}</p>
                  <p className="text-[9px] text-gray-500">AST</p>
                </div>
                <div className="text-center bg-dark-200/50 rounded-lg py-2">
                  <p className="text-sm font-bold text-white">{player.rating?.toFixed(1)}</p>
                  <p className="text-[9px] text-gray-500">RAT</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlayersPage;
