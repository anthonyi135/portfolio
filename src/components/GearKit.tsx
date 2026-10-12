import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Monitor, Cpu, Video, Sliders, ShieldCheck } from 'lucide-react';

interface GearItem {
  id: number;
  name: string;
  category: string;
  tag: 'vision' | 'cinema' | 'wireless' | 'audio' | 'aerial';
  icon: any;
  description: string;
}

const gearItems: GearItem[] = [
  {
    id: 1,
    name: 'Blackmagic ATEM Multi-Bus Switchers',
    category: 'Production Switchers',
    tag: 'vision',
    icon: Sliders,
    description: 'Blackmagic ATEM 2 M/E & ATEM Mini Pro setups for low-latency live vision mixing, ISO recording, and multi-endpoint feeds.',
  },
  {
    id: 2,
    name: 'Osee GoStream Duet',
    category: 'Hardware Encoder',
    tag: 'vision',
    icon: Cpu,
    description: 'Dual-channel hardware encoding system for redundancy and concurrent live broadcasts to YouTube, RTMP servers, and social endpoints.',
  },
  {
    id: 3,
    name: 'Blackmagic Pocket Cinema Camera 6K',
    category: 'Cinema Camera',
    tag: 'cinema',
    icon: Camera,
    description: 'Super 35 sensor capturing 6K BRAW footage for high-fidelity commercial master recordings and key live camera angles.',
  },
  {
    id: 4,
    name: 'Sony Cinema & Camcorder Systems',
    category: 'Primary Camera Systems',
    tag: 'cinema',
    icon: Camera,
    description: 'Sony FX6, A7IV, A7III, and PXW-Z150 broadcast camcorders optimized for dual-native ISO sensitivity and clean continuous HDMI/SDI output.',
  },
  {
    id: 5,
    name: 'Canon Cinema & Production Bodies',
    category: 'Multi-Camera Array',
    tag: 'cinema',
    icon: Camera,
    description: 'Canon C300 Mark II, R6, RP, and 80D supporting multi-perspective interview setups and long-focal-length event coverage.',
  },
  {
    id: 6,
    name: 'Hollyland Pyro Wireless Transmission',
    category: 'Wireless Video Links',
    tag: 'wireless',
    icon: Monitor,
    description: 'Hollyland Pyro S and Pyro H dual-band transmitter arrays delivering zero-latency wireless HDMI/SDI video up to 1,300ft.',
  },
  {
    id: 7,
    name: 'DJI Gimbal Stabilization Series',
    category: 'Camera Motion & Rigging',
    tag: 'cinema',
    icon: Video,
    description: 'DJI RS4, RS3, and RS3 Mini 3-axis electronic gimbals delivering fluid tracking shots and steady roving camera operation.',
  },
  {
    id: 8,
    name: 'Sennheiser & Professional Shotguns',
    category: 'Broadcast Audio Capture',
    tag: 'audio',
    icon: Mic,
    description: 'Sennheiser MKH 416 shotgun microphone paired with multi-channel wireless bodypack transmitters for clean speech capture.',
  },
  {
    id: 9,
    name: 'DJI Aerial Drone Fleet',
    category: 'Aerial Cinematography',
    tag: 'aerial',
    icon: Camera,
    description: 'DJI Mavic 3 Pro, Mavic 2 Pro, and Mini 3 aircraft providing 4K/DCI high-angle perspective for venue overviews and concerts.',
  },
];

const GearKit = () => {
  const [filter, setFilter] = useState<'all' | 'vision' | 'cinema' | 'wireless' | 'audio'>('all');

  const filteredGear = gearItems.filter((item) =>
    filter === 'all' ? true : item.tag === filter
  );

  return (
    <section id="gear" className="py-24 sm:py-32 px-4 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-widest text-sky-400 uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Technical Standards
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 sm:mb-6">
            Production & Engineering Arsenal
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-3xl mx-auto px-2">
            A reliable hardware and software ecosystem built for zero-failure live broadcasts and cinematic master deliverables.
          </p>
        </motion.div>

        {/* Filter Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { id: 'all', label: 'Complete Rig' },
            { id: 'vision', label: 'Vision & Switching' },
            { id: 'cinema', label: 'Cinema Cameras' },
            { id: 'wireless', label: 'Wireless Transmission' },
            { id: 'audio', label: 'Audio Chain' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                filter === cat.id
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Arsenal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGear.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-black/60 rounded-xl p-6 border border-zinc-800/80 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-sky-500/50 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-6 h-6 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Protocols Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 p-6 rounded-2xl bg-black border border-zinc-800 text-center flex flex-col md:flex-row items-center justify-around gap-4 text-xs font-mono text-zinc-400"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>DaVinci Resolve Studio (Color & Master Delivery)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>OBS Studio & NDI IP Routing (Low-Latency Feeds)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Multi-Destination RTMP (YouTube & Socials)</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GearKit;