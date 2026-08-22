import { motion } from 'framer-motion';
import { formatTime, getStageColor, getStageLabel, getStageBgColor } from '../utils/helpers';
import { useAuction } from '../context/AuctionContext';

const CountdownTimer = () => {
  const { remainingTime, stage, isLive, isPaused, settings } = useAuction();
  const totalDuration = settings?.auctionDuration || 30;
  const progress = isLive || isPaused ? (remainingTime / totalDuration) * 100 : 100;
  const isFinalCall = stage === 'FINAL_CALL';
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getProgressColor = () => {
    if (stage === 'GOING_ONCE') return '#4ADE80';
    if (stage === 'GOING_TWICE') return '#FACC15';
    if (stage === 'FINAL_CALL') return '#E5232A';
    return '#555555';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Stage indicator */}
      {(isLive || isPaused) && (
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-6 py-2 rounded-full border font-display font-bold text-sm uppercase tracking-widest ${getStageBgColor(stage)} ${getStageColor(stage)} ${isFinalCall ? 'animate-pulse-fast' : ''}`}
        >
          {getStageLabel(stage)}
        </motion.div>
      )}

      {/* Circular timer */}
      <div className={`relative ${isFinalCall ? 'animate-glow rounded-full' : ''}`}>
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="70" cy="70" r="54"
            stroke="#2A2A2A"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="70" cy="70" r="54"
            stroke={getProgressColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={remainingTime}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`font-mono font-bold ${isFinalCall ? 'text-3xl text-primary' : 'text-2xl text-white'}`}
          >
            {formatTime(remainingTime)}
          </motion.span>
        </div>
      </div>

      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider"
        >
          ⏸ PAUSED
        </motion.div>
      )}
    </motion.div>
  );
};

export default CountdownTimer;
