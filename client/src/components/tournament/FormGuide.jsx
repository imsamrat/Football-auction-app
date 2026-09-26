import { motion } from 'framer-motion';

const FormGuide = ({ form = [] }) => {
  const getFormBadge = (result) => {
    switch (result) {
      case 'W': return { bg: 'bg-green-500', text: 'W' };
      case 'D': return { bg: 'bg-yellow-500', text: 'D' };
      case 'L': return { bg: 'bg-red-500', text: 'L' };
      default: return { bg: 'bg-dark-400', text: '-' };
    }
  };

  return (
    <div className="flex items-center gap-1">
      {form.map((result, i) => {
        const badge = getFormBadge(result);
        return (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`w-6 h-6 ${badge.bg} rounded text-[10px] font-bold text-white flex items-center justify-center`}
          >
            {badge.text}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FormGuide;
