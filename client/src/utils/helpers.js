// Global mutable currency symbol, updated from settings
let _currencySymbol = '$';

export const setCurrencySymbol = (symbol) => {
  _currencySymbol = symbol || '$';
};

export const getCurrencySymbol = () => _currencySymbol;

export const formatCurrency = (amount) => {
  return `${_currencySymbol}${Number(amount || 0).toLocaleString('en-US')}`;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getStageColor = (stage) => {
  switch (stage) {
    case 'GOING_ONCE': return 'text-green-400';
    case 'GOING_TWICE': return 'text-yellow-400';
    case 'FINAL_CALL': return 'text-primary';
    case 'SOLD': return 'text-green-400';
    case 'UNSOLD': return 'text-yellow-400';
    default: return 'text-white';
  }
};

export const getStageLabel = (stage) => {
  switch (stage) {
    case 'GOING_ONCE': return 'GOING ONCE';
    case 'GOING_TWICE': return 'GOING TWICE';
    case 'FINAL_CALL': return 'FINAL CALL';
    case 'SOLD': return 'SOLD';
    case 'UNSOLD': return 'UNSOLD';
    case 'PAUSED': return 'PAUSED';
    case 'WAITING': return 'WAITING';
    default: return stage;
  }
};

export const getStageBgColor = (stage) => {
  switch (stage) {
    case 'GOING_ONCE': return 'bg-green-500/20 border-green-500/30';
    case 'GOING_TWICE': return 'bg-yellow-500/20 border-yellow-500/30';
    case 'FINAL_CALL': return 'bg-primary/20 border-primary/30';
    case 'SOLD': return 'bg-green-500/20 border-green-500/30';
    case 'UNSOLD': return 'bg-yellow-500/20 border-yellow-500/30';
    default: return 'bg-dark-50/50 border-dark-300/30';
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'SOLD': return 'badge-sold';
    case 'UNSOLD': return 'badge-unsold';
    case 'LIVE': return 'badge-live';
    case 'UPCOMING': return 'badge-upcoming';
    default: return 'badge-upcoming';
  }
};

export const getPositionColor = (position) => {
  switch (position) {
    case 'GOALKEEPER': return 'bg-yellow-500/20 text-yellow-400';
    case 'DEFENDER': return 'bg-blue-500/20 text-blue-400';
    case 'MIDFIELDER': return 'bg-green-500/20 text-green-400';
    case 'STRIKER': return 'bg-red-500/20 text-red-400';
    case 'WINGER': return 'bg-purple-500/20 text-purple-400';
    case 'FORWARD': return 'bg-orange-500/20 text-orange-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export const getPlayerInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};
