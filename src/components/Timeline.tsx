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
    title: 'Lead Technical Director',
    company: 'LiveStream Productions',
    responsibilities: [
      'Managing multi-camera live broadcasts for corporate events and conferences',
      'Operating ATEM switchers and coordinating camera operators',
      'Implementing NDI workflows for IP-based video production',
      'Training junior operators on broadcast equipment and protocols',
    ],
  },
  {
    id: 2,
    year: '2021 - 2023',
    title: 'Video Production Specialist',
    company: 'Creative Media House',
    responsibilities: [
      'Shooting and editing branded content for Fortune 500 clients',
      'Operating cinema cameras including RED and Canon C-series',
      'Color grading in DaVinci Resolve and Adobe Premiere Pro',
      'Managing lighting setups for interviews and product shoots',
    ],
  },
  {
    id: 3,
    year: '2019 - 2021',
    title: 'Camera Operator & Stream Manager',
    company: 'Esports Broadcasting Network',
    responsibilities: [
      'Operating PTZ and manual cameras for live gaming tournaments',
      'Managing OBS Studio for multi-stream outputs to Twitch and YouTube',
      'Coordinating with commentators and production team during live events',
      'Troubleshooting technical issues in real-time broadcast scenarios',
    ],
  },
  {
    id: 4,
    year: '2018 - 2019',
    title: 'Freelance Videographer',
    company: 'Independent',
    responsibilities: [
      'Shooting weddings, events, and corporate videos',
      'Building client relationships and managing project workflows',
      'Developing skills across multiple camera systems and editing platforms',
      'Creating highlight reels and delivering final products on tight deadlines',
    ],
  },
];

const Timeline = () => {
  return (
    <section className="py-24 px-4 bg-black">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Production Experience
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A journey through technical directing, camera operation, and broadcast management
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-cyan-500 to-blue-600 transform md:-translate-x-1/2"></div>

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative mb-12 md:mb-16 flex flex-col md:flex-row ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center gap-8`}
            >
              <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="bg-gray-900 p-6 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-400 font-semibold">{exp.year}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
                  <p className="text-cyan-400 font-medium mb-4">{exp.company}</p>
                  <ul className={`space-y-2 text-gray-400 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 flex-shrink-0">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="absolute left-0 md:left-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center transform md:-translate-x-1/2 shadow-lg shadow-blue-500/50 z-10">
                <Briefcase className="w-6 h-6 text-white" />
              </div>

              <div className="w-full md:w-5/12"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
