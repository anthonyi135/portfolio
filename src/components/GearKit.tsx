import { motion } from 'framer-motion';
import { Camera, Mic, Monitor, Cpu, Video, Sliders } from 'lucide-react';

interface GearItem {
  id: number;
  name: string;
  category: string;
  icon: any;
  description: string;
}

const gearItems: GearItem[] = [
  {
    id: 1,
    name: 'Canon Cameras',
    category: 'Production Cameras',
    icon: Camera,
    description: 'Canon C300 Mark II, Canon 80D, Canon RP, Canon R6',
  },
  {
    id: 2,
    name: 'Sony Cameras',
    category: 'Production Cameras',
    icon: Camera,
    description: 'Sony A7III, Sony A7IV, Sony PXY-Z150, Sony FX6',
  },
  {
    id: 3,
    name: 'Blackmagic Pocket Cinema Camera 6K',
    category: 'Cinema Camera',
    icon: Camera,
    description: 'Compact 6K cinema camera for high-end commercial work',
  },
  {
    id: 4,
    name: 'ATEM Mini Pro',
    category: 'Video Switcher',
    icon: Sliders,
    description: 'Multi-camera live production switcher with streaming capabilities',
  },
  {
    id: 5,
    name: 'Blackmagic ATEM 2 M/E',
    category: 'Production Switcher',
    icon: Monitor,
    description: 'Professional broadcast switcher for large-scale productions',
  },
  {
    id: 6,
    name: 'Osee GoStream Duet',
    category: 'Encoder',
    icon: Cpu,
    description: 'Dual HDMI encoder for multi-platform streaming',
  },
  {
    id: 7,
    name: 'DJI RS3, RS3 Mini & RS4',
    category: 'Stabilizer',
    icon: Video,
    description: '3-axis gimbal for smooth cinematic camera movements',
  },
  {
    id: 8,
    name: 'Sennheiser MKH 416',
    category: 'Microphone',
    icon: Mic,
    description: 'Industry-standard shotgun microphone for professional audio',
  },
  {
    id: 9,
    name: 'Hollyland Transmission Systems',
    category: 'Wireless Transmission Systems',
    icon: Monitor,
    description: 'Hollyland Pyro s & Hollyland Pyro H',
  },
];

const GearKit = () => {
  return (
    <section className="py-24 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Technical Gear Kit
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Professional equipment proficiency across cameras, switchers, and broadcast technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gearItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-blue-400 font-medium mb-3">{item.category}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-lg">
            + Proficient with{' '}
            <span className="text-blue-400 font-semibold">Adobe Creative Suite</span>,{' '}
            <span className="text-cyan-400 font-semibold">DaVinci Resolve</span>,{' '}
            <span className="text-blue-400 font-semibold">OBS Studio</span>, and{' '}
            <span className="text-cyan-400 font-semibold">NDI workflows</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GearKit;
