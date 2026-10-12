import { motion } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'PORTFOLIO', path: '/portfolio' },
    { label: 'EXPERIENCE', path: '/experience' },
    { label: 'GEAR KIT', path: '/gear' },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/75 backdrop-blur-xl border-b border-white/5 uppercase font-sans tracking-widest text-xs"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-3.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-md bg-white p-0.5 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm shadow-white/20">
            <img
              src="/tony_white.png"
              alt="Tonyshotit Logo"
              loading="lazy"
              className="w-full h-full object-cover rounded filter brightness-0"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-black text-white tracking-[0.2em] leading-none">
              TONYSHOTIT
            </span>
            <span className="text-[9px] font-mono text-zinc-500 tracking-widest mt-1">
              STUDIOS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 pl-8 border-l border-zinc-800/80">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-semibold text-[11px] tracking-[0.2em] transition-colors duration-200 relative py-1 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action CTA Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="mailto:anthony@tonyshotit.com"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-800 bg-white/5 hover:bg-white hover:text-black text-zinc-300 font-bold text-[10px] tracking-widest transition-all duration-300"
          >
            <span>BOOK PRODUCTION</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#0a0a0e] border-t border-zinc-900 px-6 py-6 space-y-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left text-xs font-semibold tracking-[0.25em] text-zinc-300 hover:text-white py-3 border-b border-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <a
              href="mailto:anthony@tonyshotit.com"
              onClick={() => setIsMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-white text-black font-bold text-xs tracking-widest uppercase"
            >
              <span>INQUIRE / BOOK PRODUCTION</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;