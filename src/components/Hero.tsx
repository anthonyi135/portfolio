import { motion } from 'framer-motion';
import { Play, ChevronDown, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleNavigateToPortfolio = () => {
    // 1. Try to scroll down if Portfolio is rendered on the same page
    const portfolioElem = document.getElementById('portfolio');
    if (portfolioElem) {
      portfolioElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      // 2. Otherwise route to the dedicated portfolio page
      navigate('/portfolio');
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
      {/* Immersive Cinema Background Image/Video Container */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/tony_white.png"
          alt="Cinematography Production" 
          className="w-full h-full object-cover opacity-40 filter brightness-[0.3] contrast-[1.1]"
        />
        {/* Cinematic subtle vignette and gradient mapping overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/70 z-10"></div>
      </div>

      {/* Main Centered Typography Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-blue-400 font-semibold block mb-2">
            Tonyshotit Studio
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white tracking-tight leading-[1.1] max-w-5xl">
            Video Production &<br />
            <span className="text-white opacity-95 filter drop-shadow-[0_2px_10px_rgba(59,130,246,0.2)]">
              Live Broadcast Specialist
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-gray-300/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
        >
          Crafting compelling visual stories through professional cinematography,
          technical directing, and seamless live production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={handleNavigateToPortfolio}
            className="group relative px-10 py-4 border border-white/20 bg-white/5 backdrop-blur-md rounded-full text-white font-medium text-base tracking-wider overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:bg-white hover:text-black hover:scale-105 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Play className="w-4 h-4 fill-current group-hover:fill-black" />
              VIEW MY RECENT WORK
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </motion.div>
      </div>

      {/* Interactive Floating "Recent Work" Badge in Lower Corner */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 right-12 z-30 hidden md:block"
      >
        <button 
          onClick={handleNavigateToPortfolio}
          className="relative flex items-center justify-center w-24 h-24 rounded-full border border-white/10 bg-black/60 backdrop-blur-md group hover:border-blue-500 transition-all duration-500 cursor-pointer"
        >
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping opacity-75 group-hover:duration-1000"></span>
          
          <div className="flex flex-col items-center justify-center text-[10px] tracking-widest text-gray-400 group-hover:text-white transition-colors duration-300 font-medium">
            <Video className="w-5 h-5 mb-1 text-blue-500" />
            <span>RECENT</span>
            <span>WORK</span>
          </div>
        </button>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          onClick={handleNavigateToPortfolio}
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;