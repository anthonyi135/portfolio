import { motion } from 'framer-motion';
import { Film, Radio, Layers, Check, ArrowRight, Sparkles } from 'lucide-react';

interface ProductionTiersProps {
  onSelectTier: (serviceType: string) => void;
}

const tiers = [
  {
    badge: 'TIER 01 • COMMERCIAL & BRAND',
    title: 'Cinema & Content Production',
    serviceKey: 'Commercial Video & Editing',
    description:
      'High-impact visual storytelling for corporate documentaries, brand campaigns, executive interviews, and vertical social reels.',
    accent: 'border-zinc-800 hover:border-amber-500/50',
    badgeColor: 'text-amber-400',
    icon: Film,
    buttonStyle: 'bg-zinc-900 hover:bg-amber-400 text-white hover:text-black border border-zinc-800',
    features: [
      '4K Cinema Camera Package (Sony FX30 / A7III)',
      'DJI RS 5 Gimbal & 4K Aerial Drone Coverage',
      'Wireless Lavalier Audio & Studio Lighting',
      'DaVinci Resolve Studio Color Grade & Master Cuts',
      '9:16 Vertical Reels + 16:9 Master Deliverables',
    ],
  },
  {
    badge: 'TIER 02 • MOST REQUESTED',
    title: 'Multi-Camera Live Broadcast',
    serviceKey: 'Live Multi-Camera Broadcast',
    featured: true,
    description:
      'Turnkey live video switching, multi-destination streaming, and crystal-clear audio routing for conferences, concerts, and ceremonies.',
    accent: 'border-sky-500/60 shadow-2xl shadow-sky-500/10',
    badgeColor: 'text-sky-400',
    icon: Radio,
    buttonStyle: 'bg-sky-500 hover:bg-sky-400 text-black font-black',
    features: [
      '3 to 6+ Synchronous Camera Feeds (Wired & Wireless)',
      'Blackmagic ATEM / GoStream ISO Vision Mixing',
      'Custom Lower-Thirds, Lyrics & NDI Graphic Overlays',
      'Simultaneous YouTube, Instagram & Zoom RTMP Feeds',
      'Dedicated Client Portal Delivery of Master Program',
    ],
  },
  {
    badge: 'TIER 03 • ENTERPRISE HYBRID',
    title: 'Full Broadcast + Post-Production',
    serviceKey: 'Hybrid Broadcast + Post-Production',
    description:
      'Complete end-to-end event engineering combining live multi-cam transmission with dedicated roving cinema units for post-event films.',
    accent: 'border-zinc-800 hover:border-purple-500/50',
    badgeColor: 'text-purple-400',
    icon: Layers,
    buttonStyle: 'bg-zinc-900 hover:bg-white text-white hover:text-black border border-zinc-800',
    features: [
      'Full Live Broadcast Crew + Roving Cinema Unit',
      'Multi-Track ISO Recording for Post-Event Re-Cuts',
      'Aerial Drone Establishing & Crowd Sequences',
      'Same-Day Social Highlight Reel Turnaround',
      'Comprehensive Technical Rider & Signal Routing',
    ],
  },
];

const ProductionTiers = ({ onSelectTier }: ProductionTiersProps) => {
  return (
    <section className="py-24 sm:py-32 px-4 bg-black relative overflow-hidden border-t border-zinc-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-widest text-sky-400 uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Production Scopes
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-5">
            Tailored Production Packages
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
            Select a production tier below to configure a custom rate card and technical crew for your event or campaign.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative bg-zinc-950/90 rounded-2xl border p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${tier.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${tier.badgeColor}`} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                    {tier.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {tier.description}
                  </p>

                  <ul className="space-y-3 mb-8 border-t border-zinc-900 pt-6">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.badgeColor}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTier(tier.serviceKey)}
                  className={`w-full py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${tier.buttonStyle}`}
                >
                  <span>Request Quote for This Tier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductionTiers;