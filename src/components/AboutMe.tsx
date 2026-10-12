import { motion } from 'framer-motion';
import { Radio, ShieldCheck, Award, Film } from 'lucide-react';

const AboutMe = () => {
  return (
    <section id="about" className="py-24 sm:py-32 px-4 bg-black relative overflow-hidden border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-widest text-sky-400 uppercase mb-4">
            <Award className="w-3.5 h-3.5" /> Studio Leadership
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            Behind Tonyshotit Studios
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Led by Anthony Ibuzo, Tonyshotit Studios operates at the intersection of live broadcast engineering and narrative cinematography.
          </p>
        </motion.div>

        {/* Two-Column Studio Narrative */}
        <div className="grid md:grid-cols-2 gap-8 text-zinc-400 text-sm sm:text-base leading-relaxed mb-16">
          <div className="bg-zinc-950 p-6 sm:p-8 rounded-2xl border border-zinc-900">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-400" /> Live Vision Mixing & Directing
            </h3>
            <p>
              We specialize in zero-failure live broadcasts for university ceremonies, corporate symposiums, and institutional services. Managing multi-camera vision mixers, NDI signal distribution, ISO recordings, and multi-platform RTMP destinations, our crews ensure flawless live transmissions that engage thousands of synchronous viewers.
            </p>
          </div>

          <div className="bg-zinc-950 p-6 sm:p-8 rounded-2xl border border-zinc-900">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" /> Commercial Digital Cinema
            </h3>
            <p>
              In our post-production and cinema workflows, every project is engineered in DaVinci Resolve Studio utilizing calibrated color science. From aerial perspectives to stabilized roving camera work, we deliver high-impact brand documentaries, promotional spots, and archival video content for reputable organizations.
            </p>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-t border-zinc-900 pt-10">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> CAC Registered Entity (BN: 9926513)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Corporate Compliance & TIN Ready
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Based in Lagos, Nigeria
          </span>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;