import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw } from 'lucide-react';
import { getSettings, updateSettings } from '../services/settingsService';
import toast from 'react-hot-toast';

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
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bid Increment (৳)</label>
              <input type="number" value={settings.bidIncrement} onChange={(e) => setSettings({...settings, bidIncrement: parseInt(e.target.value)})} className="input-field" min="100" />
            </div>
          </div>
        </motion.div>

        {/* Bid Extension */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
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
