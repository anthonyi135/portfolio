import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Radio, Camera, Cpu } from 'lucide-react';
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
}

const projects: Project[] = [
  {
    id: 1,
    title: 'WHAT A FINALIST FEELS LIKE',
    category: 'video',
    videoSrc: 'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/FINALIST%20EP%201%20FINAL.mp4',
    poster: '',
    role: 'Director of Photography, Editor',
    equipment: ['SONY A7III', 'Davinci Resolve Studio'],
    description: 'This is what it feels like to be a Final Year Student in University. The project captures the essence of the final year experience, highlighting the emotions, challenges, and triumphs of students as they navigate their last year of academic life.',
  },
  {
    id: 2,
    title: 'PAN-ATLANTIC UNIVERSITY NOSTALGIA CONCERT',
    category: 'live',
    videoSrc: 'https://www.youtube.com/embed/LjIgZi8yz1s?si=dTRXEfO7GtaSXURy&start=17343',
    poster: '/tony_youtube.png',
    role: 'Technical Director',
    equipment: ['ATEM Mini Pro', 'Sony A7III', 'Osee GoStream Duet', 'Canon c300 Mark II', 'Sony PXW-Z150', 'Blackmagic Pocket Cinema Camera 6K', 'Hollyland Pyro H Wireless Transmitter System'],
    description: 'Multi-camera live broadcast for a 1000+ viewer event. Managed 6 camera angles, audio mixing, and real-time graphics overlay.',
  },
  {
    id: 3,
    title: 'THE PAU PROJECT',
    category: 'video',
    videoSrc: 'https://basingnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/pau-project.mp4',
    poster: '',
    role: 'Director of Photography, Editor',
    equipment: ['DJI Mini 3', 'Davinci Resolve Studio'],
    description: 'A sweeping aerial tour of the Pan-Atlantic University campus. This project utilizes cinematic drone movements to capture the architectural beauty and serene landscape of the university, highlighting the scale and design of the institution from a unique perspective.',
  },
    {
    id: 4,
    title: 'PAN-ATLANTIC UNIVERSITY NOSTALGIA CONCERT',
    category: 'live',
    videoSrc: 'https://www.youtube.com/embed/LjIgZi8yz1s?si=dTRXEfO7GtaSXURy&start=17343',
    poster: '/tony_youtube.png',
    role: 'Technical Director',
    equipment: ['ATEM Mini Pro', 'Sony A7III', 'Osee GoStream Duet', 'Canon c300 Mark II', 'Sony PXW-Z150', 'Blackmagic Pocket Cinema Camera 6K', 'Hollyland Pyro H Wireless Transmitter System'],
    description: 'Multi-camera live broadcast for a 1000+ viewer event. Managed 6 camera angles, audio mixing, and real-time graphics overlay.',
  },
    {
    id: 5,
    title: 'PAN-ATLANTIC UNIVERSITY NOSTALGIA CONCERT',
    category: 'live',
    videoSrc: 'https://www.youtube.com/embed/LjIgZi8yz1s?si=dTRXEfO7GtaSXURy&start=17343',
    poster: '/tony_youtube.png',
    role: 'Technical Director',
    equipment: ['ATEM Mini Pro', 'Sony A7III', 'Osee GoStream Duet', 'Canon c300 Mark II', 'Sony PXW-Z150', 'Blackmagic Pocket Cinema Camera 6K', 'Hollyland Pyro H Wireless Transmitter System'],
    description: 'Multi-camera live broadcast for a 1000+ viewer event. Managed 6 camera angles, audio mixing, and real-time graphics overlay.',
  },
    {
    id: 3,
    title: 'THE PAU PROJECT',
    category: 'video',
    videoSrc: 'https://basingnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/pau-project.mp4',
    poster: '',
    role: 'Director of Photography, Editor',
    equipment: ['DJI Mini 3', 'Davinci Resolve Studio'],
    description: 'A sweeping aerial tour of the Pan-Atlantic University campus. This project utilizes cinematic drone movements to capture the architectural beauty and serene landscape of the university, highlighting the scale and design of the institution from a unique perspective.',
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'video' | 'live'>('all');

  const filteredProjects = projects.filter((project) =>
    activeCategory === 'all' ? true : project.category === activeCategory
  );

  return (
    <section id="portfolio" className="py-16 sm:py-24 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
            Featured Work
          </h2>
          <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
            A curated selection of video production projects and live broadcast experiences
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 sm:mb-16">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveCategory('video')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'video'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            Video Production
          </button>
          <button
            onClick={() => setActiveCategory('live')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'live'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
            Live Broadcasting
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:gap-12">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800/50"
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
                <div className="w-full">
                  <VideoPlayer src={project.videoSrc} poster={project.poster} />
                </div>

                <div className="flex flex-col justify-center mt-2 md:mt-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    {project.category === 'video' ? (
                      <Film className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Radio className="w-5 h-5 text-cyan-500" />
                    )}
                    <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                      {project.category === 'video' ? 'Video Production' : 'Live Broadcasting'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{project.title}</h3>

                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 mb-3">
                      <Camera className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Role</p>
                        <p className="text-white text-sm sm:text-base font-medium">{project.role}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-4">
                      <Cpu className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Equipment Used</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {project.equipment.map((item, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-gray-800 rounded-full text-xs sm:text-sm text-gray-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{project.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;