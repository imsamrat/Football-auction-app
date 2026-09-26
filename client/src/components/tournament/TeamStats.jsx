import { motion } from 'framer-motion';

const TeamStats = ({ standings = [] }) => {
  if (!standings.length) {
    return (
      <div className="glass-card p-6 text-center text-gray-500 text-sm">
        No team statistics available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {standings.map((team, idx) => {
        const winPct = team.played > 0 ? ((team.wins / team.played) * 100).toFixed(0) : 0;
        const avgGoals = team.played > 0 ? (team.goalsFor / team.played).toFixed(1) : '0.0';

        return (
          <motion.div
            key={team.teamId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{team.teamName}</h3>
                <p className="text-xs text-gray-500">{team.bidderName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary font-mono">{team.points}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Points</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{team.played}</div>
                <div className="text-[10px] text-gray-500 uppercase">Played</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{team.wins}</div>
                <div className="text-[10px] text-gray-500 uppercase">Won</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{team.draws}</div>
                <div className="text-[10px] text-gray-500 uppercase">Draw</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{team.losses}</div>
                <div className="text-[10px] text-gray-500 uppercase">Lost</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-dark-50/30">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-300">{team.goalsFor}</div>
                <div className="text-[10px] text-gray-500">GF</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-300">{team.goalsAgainst}</div>
                <div className="text-[10px] text-gray-500">GA</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </div>
                <div className="text-[10px] text-gray-500">GD</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-dark-50/30">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-300">{team.cleanSheets}</div>
                <div className="text-[10px] text-gray-500">Clean Sheets</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-300">{avgGoals}</div>
                <div className="text-[10px] text-gray-500">Avg Goals</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-300">{winPct}%</div>
                <div className="text-[10px] text-gray-500">Win Rate</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TeamStats;
