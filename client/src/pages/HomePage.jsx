import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Users, Trophy, Shield, Gavel, ArrowRight, Zap } from 'lucide-react';

const HomePage = () => {
  const features = [
    { icon: Radio, title: 'Real-Time Auction', desc: 'Live bidding with instant updates across all devices' },
    { icon: Shield, title: 'Secure Bidding', desc: 'Server-validated bids with JWT authentication' },
    { icon: Zap, title: '30-Second Timer', desc: 'Going Once, Going Twice, Final Call stages' },
    { icon: Trophy, title: 'Results Dashboard', desc: 'Complete auction results and analytics' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 sm:py-32 px-4 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Live Player Auction Platform
            </div>

            <h1 className="text-5xl sm:text-7xl font-display font-black text-white leading-tight mb-6">
              The Ultimate{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                Auction Arena
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Professional real-time player auction platform with live bidding,
              30-second countdown timer, and instant results across all connected screens.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auction" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2 group">
                <Radio className="w-5 h-5" />
                Enter Auction Arena
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/bidder/login" className="btn-outline text-lg !px-8 !py-4 flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Login as Bidder
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-10 px-4 mb-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Ready to start?</h2>
              <p className="text-gray-400">Access the admin panel to manage players and start the auction.</p>
            </div>
            <Link to="/admin/login" className="btn-dark flex items-center gap-2 whitespace-nowrap">
              Admin Panel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
