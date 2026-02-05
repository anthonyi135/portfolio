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
    title: 'REDBULL ENCOURAGED BMX SHOWCASE',
    category: 'video',
    videoSrc: 'https://www.youtube.com/embed/uWK228UPDSw',
    poster: '',
    role: 'Director of Photography, Editor',
    equipment: ['iPhone 15 Pro', 'DJI Mini 3', 'Davinci Resolve Studio'],
    description: 'A high-octane showcase of the Red Bull Encouraged tour at Pan-Atlantic University. This project captured the raw energy of top BMX talent as they performed gravity-defying stunts, documenting the intense atmosphere and crowd engagement through dynamic, fast-paced cinematography.',
  },
  {
    id: 2,
    title: 'PAN-ATLANTIC UNIVERSITY 12TH MATRICULATION CEREMONY',
    category: 'live',
    videoSrc: '',
    poster: '',
    role: 'Technical Director, Camera Operator',
    equipment: ['ATEM Mini Pro', 'Sony A7III', 'Osee GoStream Duet', 'Canon c300 Mark II', 'Sony PXW-Z150', 'Blackmagic Pocket Cinema Camera 6K', 'Hollyland Pyro H Wireless Transmitter System'],
    description: 'Multi-camera live broadcast for a 2000+ viewer event. Managed 6 camera angles, audio mixing, and real-time graphics overlay.',
  },
  {
    id: 3,
    title: 'THE PAU PROJECT',
    category: 'video',
    videoSrc: "https://www.youtube.com/embed/jTgaBulzXic?si=5q_FhFOmkm-nLLgr",
    poster:'',
    role: 'Director of Photography, Editor',
    equipment: ['DJI Mini 3', 'Davinci Resolve Studio'],
    description: 'A sweeping aerial tour of the Pan-Atlantic University campus. This project utilizes cinematic drone movements to capture the architectural beauty and serene landscape of the university, highlighting the scale and design of the institution from a unique perspective.',
  },
    {
    id: 5,
    title: 'Se o gbo Yoruba ',
    category: 'video',
    videoSrc: 'https://www.youtube.com/embed/uFE9vXopZqs',
    poster: '/tony_youtube.png',
    role: 'Cinematographer, Colorist',
    equipment: ['Canon 80D', 'Davinci Resolve Studio', 'DJI Mini 3'],
    description: '"Se o gbo Yoruba" addresses the "othering" experienced by those unable to speak their mother tongue. This visual commentary uses intimate lifestyle sequences to highlight the tension between modern identity and cultural expectations.',
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'video' | 'live'>('all');

  const filteredProjects = projects.filter((project) =>
    activeCategory === 'all' ? true : project.category === activeCategory
  );

  return (
    <section id="portfolio" className="py-24 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Featured Work
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A curated selection of video production projects and live broadcast experiences
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveCategory('video')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'video'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Film className="w-5 h-5" />
            Video Production
          </button>
          <button
            onClick={() => setActiveCategory('live')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeCategory === 'live'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Radio className="w-5 h-5" />
            Live Broadcasting
          </button>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div>
                  <VideoPlayer src={project.videoSrc} poster={project.poster} />
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    {project.category === 'video' ? (
                      <Film className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Radio className="w-6 h-6 text-cyan-500" />
                    )}
                    <span className="text-sm text-gray-400 uppercase tracking-wider">
                      {project.category === 'video' ? 'Video Production' : 'Live Broadcasting'}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">{project.title}</h3>

                  <div className="mb-6">
                    <div className="flex items-start gap-2 mb-3">
                      <Camera className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Role</p>
                        <p className="text-white font-medium">{project.role}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-4">
                      <Cpu className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Equipment Used</p>
                        <div className="flex flex-wrap gap-2">
                          {project.equipment.map((item, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed">{project.description}</p>
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
