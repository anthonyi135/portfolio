import { motion } from 'framer-motion';
import { Briefcase, Calendar } from 'lucide-react';

interface Experience {
  id: number;
  year: string;
  title: string;
  company: string;
  responsibilities: string[];
}

const experiences: Experience[] = [
  {
    id: 1,
    year: '2023 - Present',
    title: 'Lead Technical Director & Broadcast Engineer',
    company: 'Tonyshotit Studios / Pan-Atlantic University Broadcasts',
    responsibilities: [
      'Engineered multi-camera broadcast switching for convocation ceremonies, symposiums, and live concerts',
      'Orchestrated multi-bus signal routing utilizing ATEM 2 M/E, Osee GoStream Duet, and NDI streams',
      'Configured redundant RTMP live transmission to concurrent client destinations',
      'Trained junior broadcast operators and camera personnel on live call sheets and tally workflows',
    ],
  },
  {
    id: 2,
    year: '2024',
    title: 'Head of Videography & Visual Coverage',
    company: 'TEDxPan-Atlantic University',
    responsibilities: [
      'Directed multi-camera stage coverage and primary speaker cinematography',
      'Supervised sound capture and continuous low-latency signal distribution',
      'Managed rapid-turnaround post-production editing for global TEDx publication standards',
    ],
  },
  {
    id: 3,
    year: '2022 - Present',
    title: 'Lead Vision Mixer',
    company: 'St. Agnes Catholic Church, Lagos',
    responsibilities: [
      'Executed weekly live broadcast switching for service audiences exceeding 2,000+ online viewers',
      'Managed PTZ and manual camera operators across complex multi-angle hall architecture',
      'Implemented real-time liturgical lower-thirds, hymn overlays, and clean master program recordings',
    ],
  },
  {
    id: 4,
    year: '2021 - Present',
    title: 'Commercial Cinematographer & Colorist',
    company: 'Independent Commercial Productions',
    responsibilities: [
      'Operated digital cinema platforms including Canon C-series, Sony FX-series, and BMPCC 6K rigs',
      'Delivered end-to-end editorial and color grading workflows inside DaVinci Resolve Studio',
      'Supplied drone aerial cinematography compliant with safety protocols for commercial clients',
    ],
  },
];

const Timeline = () => {
  return (
    <section id="experience" className="py-24 sm:py-32 px-4 bg-black border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-widest text-sky-400 uppercase mb-4">
            <Briefcase className="w-3.5 h-3.5" /> Proven Track Record
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Production & Engineering Track
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
            A verified timeline of live multi-camera broadcast directing, camera operations, and media leadership.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Track Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 transform md:-translate-x-1/2" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative mb-12 md:mb-16 flex flex-col md:flex-row ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-start md:items-center gap-8 pl-10 md:pl-0`}
            >
              <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 shadow-2xl hover:border-zinc-700 transition-colors">
                  <div className={`flex items-center gap-2 mb-2 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">{exp.year}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{exp.title}</h3>
                  <p className="text-sm font-semibold text-zinc-400 mb-4">{exp.company}</p>
                  
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-400 text-left">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-400 shrink-0 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Node Icon on Track */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20 z-10">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>

              <div className="hidden md:block w-full md:w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;