import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Radio, Camera, Cpu, Layers } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface Project {
  id: number;
  title: string;
  category: 'video' | 'live';
  videoSrc: string;
  poster: string;
  role: string;
  equipment: string[];
  description: string;
  isVertical?: boolean;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'WHAT A FINALIST FEELS LIKE',
    category: 'video',
    videoSrc: 'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/FINALIST%20EP%201%20FINAL.mp4',
    poster: '',
    role: 'Director of Photography • Lead Editor',
    equipment: ['Sony A7III', 'DaVinci Resolve Studio', 'S-Log3 Color Science'],
    description: 'A cinematic documentary piece capturing the emotional, academic, and personal journey of university final-year students navigating their transition into industry.',
    isVertical: true,
  },
  {
    id: 2,
    title: 'PAN-ATLANTIC UNIVERSITY NOSTALGIA CONCERT',
    category: 'live',
    videoSrc: 'https://www.youtube.com/embed/LjIgZi8yz1s?si=dTRXEfO7GtaSXURy&start=17343',
    poster: '/tony_youtube.png',
    role: 'Technical Director • Vision Mixer',
    equipment: ['ATEM Mini Pro', 'Osee GoStream Duet', 'Canon C300 Mark II', 'Sony PXW-Z150', 'BMPCC 6K', 'Hollyland Pyro H System'],
    description: 'Turnkey live multi-camera broadcast for a live audience of 1,000+ attendees. Engineered 6 synchronous camera feeds, multi-bus audio routing, and low-latency master program delivery.',
  },
  {
    id: 3,
    title: 'PAU IS COMMUNITY',
    category: 'video',
    videoSrc: 'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/PAU%20IN%20COMMUNITY%20FINAL.mp4',
    poster: '',
    role: 'Director of Photography • Colorist',
    equipment: ['DJI Mini 3', 'Sony A7III', 'DJI RS 5', 'DaVinci Resolve Studio'],
    description: 'Corporate brand anthem emphasizing collective civic responsibility, inclusivity, and campus community engagement across Pan-Atlantic University.',
    isVertical: true,
  },
  {
    id: 4,
    title: 'MEDIA RE-IMAGINED',
    category: 'live',
    videoSrc: 'https://www.youtube.com/embed/wDLlOgtKl9U?si=uWd1kH9CkpE9M3FB',
    poster: '/tony_youtube.png',
    role: 'Technical Director • Signal Router',
    equipment: ['ATEM Mini Pro', 'Sony A7III', 'Osee GoStream Duet', 'Canon C300 Mark II', 'Sony PXW-Z150', 'Hollyland Pyro Systems'],
    description: 'Symposium broadcast engineering featuring live multi-endpoint transmission, lower-third graphic overlays, and clean HDMI/SDI matrix switching.',
  },
  {
    id: 5,
    title: 'STORY BEHIND CROWNEDBYANNIE',
    category: 'video',
    videoSrc: 'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/CROWNED%20-%20EP%201%20F.mp4',
    poster: '',
    role: 'Cinematographer • Post-Production Lead',
    equipment: ['Sony A7III', 'DaVinci Resolve Studio', 'Wireless Audio Sync'],
    description: 'Mini-documentary profile capturing the entrepreneurial trajectory, international expansion, and craft of Canadian-based hairstylist CrownedbyAnnie.',
    isVertical: true,
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'video' | 'live'>('all');

  const filteredProjects = projects.filter((project) =>
    activeCategory === 'all' ? true : project.category === activeCategory
  );

  return (
    <section id="portfolio" className="relative py-24 sm:py-32 px-4 bg-black overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-950/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-widest text-sky-400 uppercase mb-4">
            <Layers className="w-3.5 h-3.5" /> Selected Productions
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 sm:mb-6">
            Featured Broadcasts & Films
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto px-2">
            Explore commercial cinematography, multi-camera live switching, and institutional video productions.
          </p>
        </motion.div>

        {/* Filter Switcher */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-14 sm:mb-20">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Work ({projects.length})
          </button>
          <button
            onClick={() => setActiveCategory('live')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'live'
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            Live Broadcast ({projects.filter((p) => p.category === 'live').length})
          </button>
          <button
            onClick={() => setActiveCategory('video')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'video'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Film className="w-4 h-4" />
            Cinematography ({projects.filter((p) => p.category === 'video').length})
          </button>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 gap-12 sm:gap-16">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-zinc-950/90 rounded-2xl overflow-hidden border border-zinc-900 hover:border-zinc-800 transition-all duration-300 shadow-2xl backdrop-blur-sm"
              >
                <div className="grid md:grid-cols-12 gap-6 md:gap-8 p-5 sm:p-7 md:p-10 items-center">
                  {/* Media Section */}
                  <div className={`w-full flex items-center justify-center ${project.isVertical ? 'md:col-span-5' : 'md:col-span-7'}`}>
                    <div className="w-full max-w-md mx-auto">
                      <VideoPlayer 
                        src={project.videoSrc} 
                        poster={project.poster} 
                        isVertical={project.isVertical}
                      />
                    </div>
                  </div>

                  {/* Project Info Section */}
                  <div className={`flex flex-col justify-center ${project.isVertical ? 'md:col-span-7' : 'md:col-span-5'}`}>
                    <div className="flex items-center gap-2.5 mb-3">
                      {project.category === 'video' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400 tracking-widest uppercase">
                          <Film className="w-3 h-3" /> Digital Cinema
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-[11px] font-bold text-sky-400 tracking-widest uppercase">
                          <Radio className="w-3 h-3" /> Live Multi-Cam
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4 leading-tight">
                      {project.title}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2.5">
                        <Camera className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Production Role</p>
                          <p className="text-sm font-semibold text-zinc-200">{project.role}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Cpu className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Hardware & Pipeline</p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.equipment.map((item, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-medium text-zinc-300"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;