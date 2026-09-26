import { motion } from 'framer-motion';
import FormGuide from './FormGuide';

const PointTable = ({ standings = [], compact = false }) => {
  if (!standings.length) {
    return (
      <div className="glass-card p-8 text-center text-gray-500">
        <p>No standings data available yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-50/50 text-gray-400 uppercase text-xs tracking-wider">
              <th className="py-3 px-3 text-left w-10">#</th>
              <th className="py-3 px-3 text-left">Team</th>
              <th className="py-3 px-2 text-center w-10">P</th>
              <th className="py-3 px-2 text-center w-10">W</th>
              <th className="py-3 px-2 text-center w-10">D</th>
              <th className="py-3 px-2 text-center w-10">L</th>
              {!compact && (
                <>
                  <th className="py-3 px-2 text-center w-10">GF</th>
                  <th className="py-3 px-2 text-center w-10">GA</th>
                </>
              )}
              <th className="py-3 px-2 text-center w-10">GD</th>
              <th className="py-3 px-2 text-center w-14 font-bold">PTS</th>
              {!compact && <th className="py-3 px-3 text-center">Form</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => (
              <motion.tr
                key={team.teamId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b border-dark-50/30 hover:bg-dark-200/50 transition-colors ${
                  idx === 0 ? 'bg-primary/5' : ''
                }`}
              >
                <td className="py-3 px-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-primary text-white' :
                    idx < 3 ? 'bg-dark-300 text-white' :
                    'text-gray-500'
                  }`}>
                    {team.position}
                  </div>
                </td>
                <td className="py-3 px-3 font-medium text-white whitespace-nowrap">
                  {team.teamName}
                </td>
                <td className="py-3 px-2 text-center text-gray-400">{team.played}</td>
                <td className="py-3 px-2 text-center text-green-400">{team.wins}</td>
                <td className="py-3 px-2 text-center text-yellow-400">{team.draws}</td>
                <td className="py-3 px-2 text-center text-red-400">{team.losses}</td>
                {!compact && (
                  <>
                    <td className="py-3 px-2 text-center text-gray-400">{team.goalsFor}</td>
                    <td className="py-3 px-2 text-center text-gray-400">{team.goalsAgainst}</td>
                  </>
                )}
                <td className={`py-3 px-2 text-center font-medium ${
                  team.goalDifference > 0 ? 'text-green-400' :
                  team.goalDifference < 0 ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="py-3 px-2 text-center font-bold text-white text-base">
                  {team.points}
                </td>
                {!compact && (
                  <td className="py-3 px-3">
                    <FormGuide form={team.form} />
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointTable;
