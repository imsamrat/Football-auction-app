import { motion } from 'framer-motion';

const eventIcons = {
  GOAL: '⚽',
  YELLOW_CARD: '🟨',
  RED_CARD: '🟥',
  SUBSTITUTION: '🔄',
};

const MatchTimeline = ({ events = [], homeTeamId }) => {
  if (!events.length) {
    return (
      <div className="glass-card p-6 text-center text-gray-500 text-sm">
        No match events recorded yet.
      </div>
    );
  }

  // Group events and insert half-time marker
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);
  const firstHalf = sortedEvents.filter(e => e.minute <= 45);
  const secondHalf = sortedEvents.filter(e => e.minute > 45);

  const renderEvent = (event, idx) => {
    const isHome = event.teamId === homeTeamId || event.teamId?.toString() === homeTeamId?.toString();
    const icon = eventIcons[event.type] || '•';

    return (
      <motion.div
        key={event._id || idx}
        initial={{ opacity: 0, x: isHome ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`flex items-start gap-3 ${isHome ? '' : 'flex-row-reverse text-right'}`}
      >
        {/* Minute */}
        <div className="flex-shrink-0 w-12 text-right">
          <span className="text-primary font-mono font-bold text-sm">{event.minute}'</span>
        </div>

        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center text-base">
          {icon}
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="font-medium text-white text-sm">{event.playerName}</div>
          {event.type === 'GOAL' && event.assistPlayerName && (
            <div className="text-xs text-gray-500">Assist: {event.assistPlayerName}</div>
          )}
          {event.type === 'SUBSTITUTION' && event.replacedPlayerName && (
            <div className="text-xs text-gray-500">Off: {event.replacedPlayerName}</div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Match Timeline</h3>

      {/* First half */}
      <div className="space-y-3">
        {firstHalf.map((e, i) => renderEvent(e, i))}
      </div>

      {/* Half-time marker */}
      {(firstHalf.length > 0 || secondHalf.length > 0) && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-dark-50" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest px-3 py-1 bg-yellow-500/10 rounded-full">
            Half Time
          </span>
          <div className="flex-1 h-px bg-dark-50" />
        </div>
      )}

      {/* Second half */}
      <div className="space-y-3">
        {secondHalf.map((e, i) => renderEvent(e, firstHalf.length + i))}
      </div>
    </div>
  );
};

export default MatchTimeline;
