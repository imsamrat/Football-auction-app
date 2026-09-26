import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Radio,
  Users,
  Calendar,
  Shield,
  ArrowRight,
  Zap,
  Award,
  Activity,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Gavel,
  PlayCircle,
  Table,
} from 'lucide-react';
import tournamentService from '../services/tournamentService';

const HomePage = () => {
  const [activeTournament, setActiveTournament] = useState(null);

  useEffect(() => {
    const fetchActiveTournament = async () => {
      try {
        const data = await tournamentService.getTournaments();
        if (data && data.length > 0) {
          const ongoing = data.find(t => t.status === 'ONGOING');
          setActiveTournament(ongoing || data[0]);
        }
      } catch (err) {
        // Fallback silently if tournaments are not yet created
      }
    };
    fetchActiveTournament();
  }, []);

  const features = [
    {
      icon: Radio,
      badge: 'Live Auction',
      title: 'Real-Time Player Auction',
      desc: 'Interactive bidding room with 30s timer, wallet validation, and instant team allocation.',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'hover:border-primary/40',
      link: '/auction',
    },
    {
      icon: Calendar,
      badge: 'Fixtures & Schedule',
      title: 'Automated & Manual Fixtures',
      desc: 'Single or double round-robin generator with match dates, times, and ground venues.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'hover:border-blue-500/40',
      link: '/tournament',
    },
    {
      icon: Activity,
      badge: 'Match Center',
      title: 'Live Score & Events',
      desc: 'Real-time match control: live timer, goal attribution, yellow/red cards, and substitutions.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-500/40',
      link: '/tournament',
    },
    {
      icon: Table,
      badge: 'Standings',
      title: 'Dynamic Point Tables',
      desc: 'Instant standings with GD, GF, GA, PTS, plus Golden Boot & Playmaker leaderboards.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'hover:border-amber-500/40',
      link: '/tournament',
    },
  ];

  const highlights = [
    'Real-time Socket.IO live bidding engine',
    'Automated Single & Double round-robin schedules',
    'Live match event tracking (Goals, Cards, Subs)',
    'Dynamic Point Table with auto goal-differential ranking',
    'Golden Boot (Top Scorers) & Top Assists race',
    'TV Display mode for live tournament projection',
  ];

  return (
    <div className="min-h-screen text-white pb-16">
      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Live Pill Banner */}
            {activeTournament ? (
              <Link
                to="/tournament"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-200/90 hover:bg-dark-100 border border-primary/30 text-xs sm:text-sm font-medium mb-8 transition-all hover:scale-105 shadow-lg shadow-primary/10 group"
              >
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                <span className="text-gray-300">Live Tournament:</span>
                <span className="text-white font-semibold">{activeTournament.name}</span>
                <span className="text-primary font-bold ml-1 group-hover:translate-x-0.5 transition-transform flex items-center">
                  View Standings <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-8">
                <Sparkles className="w-4 h-4" />
                <span>The Unified Football Auction & Tournament Platform</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-[1.1] mb-6">
              Draft Your Squad.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-amber-400">
                Dominate The Pitch.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              An all-in-one platform powering high-stakes <span className="text-gray-200 font-medium">live player auctions</span>,
              automated <span className="text-gray-200 font-medium">round-robin fixtures</span>, live match score tracking, and
              instant <span className="text-gray-200 font-medium">point tables</span>.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/tournament"
                className="btn-primary text-base sm:text-lg !px-8 !py-4 flex items-center justify-center gap-3 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/40 group"
              >
                <Trophy className="w-5 h-5" />
                <span>Explore Tournaments</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/auction"
                className="btn-dark text-base sm:text-lg !px-8 !py-4 flex items-center justify-center gap-3 w-full sm:w-auto border border-white/15 hover:border-primary/50 transition-all group"
              >
                <Radio className="w-5 h-5 text-primary" />
                <span>Live Auction Arena</span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Sub quick links */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-400">
              <Link to="/bidder/login" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-primary" />
                <span>Bidder Login</span>
              </Link>
              <span className="text-gray-700">•</span>
              <Link to="/display" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>TV Display Mode</span>
              </Link>
              <span className="text-gray-700">•</span>
              <Link to="/results" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Auction Results</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DUAL HUB SHOWCASE (AUCTION + TOURNAMENTS) */}
      {/* ============================================================ */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Two Core Engines</h2>
          <p className="text-2xl sm:text-4xl font-display font-bold text-white">One Seamless Experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Player Auction Platform */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 relative overflow-hidden flex flex-col justify-between border border-white/10 hover:border-primary/40 transition-all group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Auction Engine
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-3">Live Player Auction</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Run an interactive draft day. Bidders compete in real-time with 30-second timers, team budget validation,
                and instant squad confirmation.
              </p>

              <ul className="space-y-2.5 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Real-time Socket.IO live bidding across all screens</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Going Once, Going Twice, Final Call countdown timer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Bidder purse balance & squad size verification</span>
                </li>
              </ul>
            </div>

            <Link
              to="/auction"
              className="btn-primary !py-3 flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <span>Enter Auction Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 2: Football Tournament & League Hub */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 relative overflow-hidden flex flex-col justify-between border border-white/10 hover:border-emerald-500/40 transition-all group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tournament Engine
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-3">Tournaments & Matches</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Take auctioned squads straight to the pitch. Auto-generate round-robin fixtures, score live matches, and track
                point tables in real-time.
              </p>

              <ul className="space-y-2.5 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Automatic Single/Double Round-Robin & Manual fixture scheduler</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Live Match Control room: timer, goals, cards, and substitutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Auto-computed Point Tables, Top Scorers & Top Assists</span>
                </li>
              </ul>
            </div>

            <Link
              to="/tournament"
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white !py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
            >
              <span>Explore Tournaments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. 4-PILLAR FEATURE HIGHLIGHTS */}
      {/* ============================================================ */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={feature.link}
                className={`glass-card p-6 h-full flex flex-col justify-between border border-white/5 transition-all group block ${feature.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-300">
                      {feature.badge}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base text-white mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {feature.desc}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-gray-400 group-hover:text-white pt-2 border-t border-white/5">
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. KEY CAPABILITIES TICKER / LIST */}
      {/* ============================================================ */}
      <section className="py-8 px-4 max-w-5xl mx-auto">
        <div className="p-8 rounded-2xl bg-dark-200/50 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Full Platform Capabilities</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. ADMIN / ORGANIZER CALL-TO-ACTION */}
      {/* ============================================================ */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/20 shadow-2xl shadow-primary/5"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" /> Admin Portal
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
              Organizing an Auction or League?
            </h3>
            <p className="text-sm text-gray-400 max-w-xl">
              Log in to the Admin Dashboard to manage players, conduct auctions, generate fixtures, and control live matches.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-center">
            <Link
              to="/admin/login"
              className="btn-primary !px-6 !py-3 flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap shadow-lg shadow-primary/20"
            >
              <span>Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tournament"
              className="btn-dark !px-6 !py-3 flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap border border-white/10"
            >
              <span>View Matches</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
