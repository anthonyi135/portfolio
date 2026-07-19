import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'PORTFOLIO', path: '/portfolio' },
    { label: 'EXPERIENCE', path: '/experience' },
    { label: 'GEAR KIT', path: '/gear' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-white/5 uppercase font-sans tracking-widest text-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-start gap-12">
        
        {/* Brand Logo - Links back to the Home Page */}
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-8 h-8 rounded bg-white p-0.5 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img
              src="/tony_white.png"
              alt="Tonyshotit Logo"
              className="w-full h-full object-cover rounded-sm filter brightness-0"
            />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xl font-black text-white tracking-[0.15em]">
              TONYSHOTIT
            </span>
          </div>
        </Link>

        {/* Multi-Page Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 pl-8 border-l border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-white/60 hover:text-white font-medium text-xs tracking-[0.2em] transition-colors duration-200 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="ml-auto md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-white/70 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-black border-t border-white/5"
        >
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left text-xs font-medium tracking-[0.2em] text-white/70 hover:text-white py-2 border-b border-white/5 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;