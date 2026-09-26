import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';

const statusConfig = {
  UPCOMING: { label: 'Upcoming', class: 'bg-blue-500/20 text-blue-400' },
  LIVE: { label: 'LIVE', class: 'bg-red-500/20 text-red-400 animate-pulse' },
  HALF_TIME: { label: 'Half Time', class: 'bg-yellow-500/20 text-yellow-400' },
  COMPLETED: { label: 'Full Time', class: 'bg-green-500/20 text-green-400' },
  POSTPONED: { label: 'Postponed', class: 'bg-gray-500/20 text-gray-400' },
  CANCELLED: { label: 'Cancelled', class: 'bg-red-500/20 text-red-400' },
};

const FixtureCard = ({ match, onClick, showVenue = true }) => {
  const status = statusConfig[match.status] || statusConfig.UPCOMING;
  const isFinished = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE' || match.status === 'HALF_TIME';
  const homeTeam = match.homeTeamId?.team || 'TBD';
  const awayTeam = match.awayTeamId?.team || 'TBD';

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]} • ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onClick?.(match)}
      className={`glass-card p-4 cursor-pointer transition-all hover:border-primary/30 ${
        isLive ? 'border-red-500/30 shadow-lg shadow-red-500/5' : ''
      }`}
    >
      {/* Status & Round */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">Round {match.round} • Match {match.matchNumber}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.class}`}>
          {status.label}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex-1 text-right">
          <div className={`font-semibold text-sm ${isFinished && match.homeScore > match.awayScore ? 'text-white' : 'text-gray-300'}`}>
            {homeTeam}
          </div>
        </div>

        {/* Score / Time */}
        <div className="flex items-center gap-2 px-3">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold font-mono ${match.homeScore > match.awayScore ? 'text-white' : 'text-gray-400'}`}>
                {match.homeScore}
              </span>
              <span className="text-gray-600 text-sm">-</span>
              <span className={`text-xl font-bold font-mono ${match.awayScore > match.homeScore ? 'text-white' : 'text-gray-400'}`}>
                {match.awayScore}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs text-primary font-bold">{match.kickoffTime || 'TBD'}</div>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <div className={`font-semibold text-sm ${isFinished && match.awayScore > match.homeScore ? 'text-white' : 'text-gray-300'}`}>
            {awayTeam}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {match.matchDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(match.matchDate)}
            </div>
          )}
          {match.kickoffTime && (isFinished || isLive) && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {match.kickoffTime}
            </div>
          )}
        </div>
        {showVenue && match.venue && (
          <div className="flex items-center gap-1 truncate max-w-[150px]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FixtureCard;
