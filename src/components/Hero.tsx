import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Radio, Film, ArrowRight, ShieldCheck, ChevronDown, X } from 'lucide-react';

export const Hero: React.FC = () => {
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const showreelUrl = "https://www.youtube.com/embed/LjIgZi8yz1s?autoplay=1&start=17343";

  const clientList = [
    'PAN-ATLANTIC UNIVERSITY',
    'LAGOS BUSINESS SCHOOL',
    'THE ELEVATION CHURCH',
    'SCHOOL OF MEDIA & COMMUNICATION (SMC)',
    'WHITESANDS SCHOOL',
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Delay heavy iframe mount until modal animation completes to prevent INP UI blocking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isShowreelOpen) {
      document.body.style.overflow = 'hidden';
      timer = setTimeout(() => {
        setIsIframeLoaded(true);
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
      setIsIframeLoaded(false);
    }
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [isShowreelOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsShowreelOpen(false);
    };
    if (isShowreelOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShowreelOpen]);

  const scrollToPortfolio = () => {
    const section = document.getElementById('portfolio');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenShowreel = () => {
    // Immediate state dispatch keeps INP at 0ms
    setIsShowreelOpen(true);
  };

  const handleCloseShowreel = () => {
    setIsShowreelOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between pt-28 md:pt-36">
      {/* Background Lighting & Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-black to-black pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main Content Container */}
      <div className="relative max-w-6xl mx-auto px-5 w-full flex-1 flex flex-col justify-center items-center text-center z-10 py-10 pointer-events-auto">
        
        {/* Dual Pillar Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] md:text-xs font-semibold tracking-wider uppercase mb-8 shadow-inner"
        >
          <span className="flex items-center gap-1.5 text-sky-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" /> Live Broadcast
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Film className="w-3.5 h-3.5 text-amber-400" /> Digital Cinema
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-400 hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CAC Registered
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl text-white mb-6"
        >
          Engineering Multi-Camera Broadcasts &{' '}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
            Cinematic Visuals.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-10 px-2"
        >
          Tonyshotit Studios provides enterprise-grade multi-cam live production, 
          broadcast signal routing, and commercial cinematography tailored for corporate institutions, 
          academic ceremonies, and high-impact live events across Lagos.
        </motion.p>

        {/* Interactive CTA Buttons */}
        <div className="relative z-30 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenShowreel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all duration-300 shadow-xl hover:shadow-sky-500/10 hover:scale-[1.02] cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            Watch Showreel
          </button>

          <a
            href="mailto:anthony@tonyshotit.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs tracking-wider uppercase hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
          >
            Request Production Quote
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Scroll Prompt Arrow */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-14 text-zinc-600 hidden md:block cursor-pointer hover:text-zinc-400 transition-colors z-20"
          onClick={scrollToPortfolio}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Selected Clients & Institutions Ticker Ribbon */}
      <div className="relative w-full border-y border-zinc-900/90 bg-zinc-950/70 backdrop-blur-md py-4 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 mb-2 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-zinc-800" />
          <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-semibold text-center">
            Trusted By Esteemed Institutions & Organizations
          </p>
          <span className="h-px w-8 bg-zinc-800" />
        </div>

        <div className="flex overflow-hidden select-none whitespace-nowrap">
          <div className="flex shrink-0 animate-marquee items-center justify-around gap-12 sm:gap-20 text-xs sm:text-sm font-bold tracking-widest text-zinc-400">
            {clientList.concat(clientList).map((client, idx) => (
              <span 
                key={idx} 
                className="hover:text-white transition-colors duration-200 cursor-default flex items-center gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500/80" />
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* REACT PORTAL MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {isShowreelOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 md:p-10"
              onClick={handleCloseShowreel}
            >
              <button
                type="button"
                onClick={handleCloseShowreel}
                className="absolute top-6 right-6 z-[10000] w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-200 cursor-pointer shadow-2xl"
                title="Close Showreel (Esc)"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-5xl aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-sky-500/10 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {isIframeLoaded ? (
                  <iframe
                    src={showreelUrl}
                    title="Tonyshotit Studios Showreel"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 rounded-2xl"
                  />
                ) : (
                  <div className="text-zinc-600 text-xs font-mono tracking-widest uppercase animate-pulse">
                    Loading Master Showreel Stream...
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Hero;