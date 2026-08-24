import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, TrendingUp, DollarSign } from 'lucide-react';
import { getSettings, updateSettings } from '../services/settingsService';
import toast from 'react-hot-toast';

const formatPreview = (amount, symbol) => `${symbol || '$'}${Number(amount || 0).toLocaleString('en-US')}`;

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const { data } = await getSettings();
      setSettings(data);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateSettings(settings);
      setSettings(data);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const sym = settings.currencySymbol || '$';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Configure auction parameters</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auction Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-4">Auction Timer</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Duration (seconds)</label>
              <input type="number" value={settings.auctionDuration} onChange={(e) => setSettings({...settings, auctionDuration: parseInt(e.target.value)})} className="input-field" min="10" max="120" />
            </div>
          </div>
        </motion.div>

        {/* Currency Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" /> Currency
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currencySymbol || '$'}
                onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})}
                className="input-field w-32"
                maxLength={5}
                placeholder="$"
              />
              <p className="text-xs text-gray-500 mt-1">Preview: {formatPreview(150000, settings.currencySymbol)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['$', '৳', '₹', '€', '£', '¥'].map(s => (
                <button
                  key={s}
                  onClick={() => setSettings({...settings, currencySymbol: s})}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    (settings.currencySymbol || '$') === s
                      ? 'bg-primary text-white'
                      : 'bg-dark-200 text-gray-400 hover:bg-dark-300 border border-dark-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tiered Bid Increment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Bid Increment Tiers
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            The bid +/- amount changes automatically based on the current bid level
          </p>

          <div className="space-y-4">
            {/* Tier 1 */}
            <div className="bg-dark-200/50 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm font-bold text-green-400">Tier 1</span>
                <span className="text-xs text-gray-500">— Below {formatPreview(settings.bidIncrementTier1Threshold || 500000, sym)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Increment ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier1 || 10000} onChange={(e) => setSettings({...settings, bidIncrementTier1: parseInt(e.target.value) || 0})} className="input-field" min="100" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Up to ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier1Threshold || 500000} onChange={(e) => setSettings({...settings, bidIncrementTier1Threshold: parseInt(e.target.value) || 0})} className="input-field" min="1000" />
                </div>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-dark-200/50 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-sm font-bold text-yellow-400">Tier 2</span>
                <span className="text-xs text-gray-500">— {formatPreview(settings.bidIncrementTier2Lower ?? settings.bidIncrementTier1Threshold ?? 500000, sym)} to {formatPreview(settings.bidIncrementTier2Threshold || 1000000, sym)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Increment ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier2 || 20000} onChange={(e) => setSettings({...settings, bidIncrementTier2: parseInt(e.target.value) || 0})} className="input-field" min="100" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier2Lower ?? settings.bidIncrementTier1Threshold ?? 500000} onChange={(e) => setSettings({...settings, bidIncrementTier2Lower: parseInt(e.target.value) || 0})} className="input-field" min="1000" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Up to ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier2Threshold || 1000000} onChange={(e) => setSettings({...settings, bidIncrementTier2Threshold: parseInt(e.target.value) || 0})} className="input-field" min="1000" />
                </div>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-dark-200/50 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                <span className="text-sm font-bold text-red-400">Tier 3</span>
                <span className="text-xs text-gray-500">— Above {formatPreview(settings.bidIncrementTier3Lower ?? settings.bidIncrementTier2Threshold ?? 1000000, sym)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Increment ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier3 || 30000} onChange={(e) => setSettings({...settings, bidIncrementTier3: parseInt(e.target.value) || 0})} className="input-field" min="100" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From ({sym})</label>
                  <input type="number" value={settings.bidIncrementTier3Lower ?? settings.bidIncrementTier2Threshold ?? 1000000} onChange={(e) => setSettings({...settings, bidIncrementTier3Lower: parseInt(e.target.value) || 0})} className="input-field" min="1000" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bid Extension */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-4">Bid Extension</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.bidExtensionEnabled} onChange={(e) => setSettings({...settings, bidExtensionEnabled: e.target.checked})} className="w-5 h-5 rounded bg-dark-200 border-dark-50 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-300">Enable bid extension in final seconds</span>
            </label>
            {settings.bidExtensionEnabled && (
              <div className="grid grid-cols-2 gap-4 ml-8">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Extend by (seconds)</label>
                  <input type="number" value={settings.bidExtensionTime} onChange={(e) => setSettings({...settings, bidExtensionTime: parseInt(e.target.value)})} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Threshold (seconds)</label>
                  <input type="number" value={settings.bidExtensionThreshold} onChange={(e) => setSettings({...settings, bidExtensionThreshold: parseInt(e.target.value)})} className="input-field" />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Auto Auction */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-4">Auto Auction</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.autoAuction} onChange={(e) => setSettings({...settings, autoAuction: e.target.checked})} className="w-5 h-5 rounded bg-dark-200 border-dark-50 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-300">Auto-start next player after sold/unsold</span>
            </label>
            {settings.autoAuction && (
              <div className="ml-8">
                <label className="block text-xs text-gray-400 mb-1">Delay (seconds)</label>
                <input type="number" value={settings.autoAuctionDelay} onChange={(e) => setSettings({...settings, autoAuctionDelay: parseInt(e.target.value)})} className="input-field w-32" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Sound Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-4">Sound Effects</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.soundEnabled} onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})} className="w-5 h-5 rounded bg-dark-200 border-dark-50 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-300">Master sound</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer ml-6">
              <input type="checkbox" checked={settings.bidSound} onChange={(e) => setSettings({...settings, bidSound: e.target.checked})} className="w-5 h-5 rounded bg-dark-200 border-dark-50 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-300">Bid sound</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer ml-6">
              <input type="checkbox" checked={settings.soldSound} onChange={(e) => setSettings({...settings, soldSound: e.target.checked})} className="w-5 h-5 rounded bg-dark-200 border-dark-50 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-300">Sold sound</span>
            </label>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
