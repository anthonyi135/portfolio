import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  ArrowUpRight,
  Film,
  Radio,
  Sparkles,
  Youtube,
  Music,
  AtSign,
  CheckCircle2,
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { supabase } from '../lib/supabase';

interface BtsReel {
  id: string | number;
  title: string;
  tag: string;
  caption: string;
  videoSrc: string;
  igUrl: string;
}

const defaultReels: BtsReel[] = [
  {
    id: 'reel-1',
    title: 'WHAT A FINALIST FEELS LIKE',
    tag: 'CINEMATOGRAPHY & STORY',
    caption: 'Shot on Sony A7III • Graded in DaVinci Resolve Studio (S-Log3).',
    videoSrc:
      'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/FINALIST%20EP%201%20FINAL.mp4',
    igUrl: 'https://www.instagram.com/_anthony_i_/',
  },
  {
    id: 'reel-2',
    title: 'PAU IS COMMUNITY',
    tag: 'AERIAL & GIMBAL REEL',
    caption: 'DJI Mini 3 aerials paired with DJI RS 5 gimbal movement across campus.',
    videoSrc:
      'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/PAU%20IN%20COMMUNITY%20FINAL.mp4',
    igUrl: 'https://www.instagram.com/_tonyshotit/',
  },
  {
    id: 'reel-3',
    title: 'CROWNEDBYANNIE — THE STORY',
    tag: 'BRAND DOCUMENTARY REEL',
    caption: 'Founder spotlight & visual storytelling for CrownedbyAnnie.',
    videoSrc:
      'https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/CROWNED%20-%20EP%201%20F.mp4',
    igUrl: 'https://www.instagram.com/_anthony_i_/',
  },
];

const Socials = () => {
  const [reelsList, setReelsList] = useState<BtsReel[]>(defaultReels);

  useEffect(() => {
    const fetchBtsReels = async () => {
      try {
        const { data, error } = await supabase
          .from('bts_reels')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setReelsList(
            data.map((r) => ({
              id: r.id,
              title: r.title,
              tag: r.tag,
              caption: r.caption,
              videoSrc: r.video_src,
              igUrl: r.ig_url || 'https://www.instagram.com/_anthony_i_/',
            }))
          );
        }
      } catch (err) {
        console.log('Using default BTS reels fallback:', err);
      }
    };

    fetchBtsReels();
  }, []);

  return (
    <section className="relative min-h-screen bg-black text-white py-20 sm:py-28 px-4 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-r from-pink-500/10 via-sky-500/10 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold tracking-widest text-pink-400 uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Behind The Lens & Active Feeds
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4">
            Reels, Set Life &{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
              Socials.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Follow my active production journals on Instagram—from multi-camera live broadcast control rooms to commercial cinema sets across Lagos.
          </p>
        </motion.div>

        {/* DUAL INSTAGRAM SPOTLIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <motion.a
            href="https://www.instagram.com/_anthony_i_/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative bg-zinc-950 border border-zinc-800/90 hover:border-pink-500/50 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      <img
                        src="/headshot.jpg"
                        alt="Anthony Ibuzo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        @_anthony_i_
                      </h2>
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Anthony Ibuzo • Personal Creator Feed</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[11px] font-bold tracking-wider uppercase group-hover:scale-105 transition-transform">
                  <Instagram className="w-3.5 h-3.5" />
                  Follow
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-200">
                  🎬 Reel Creator
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-200">
                  🎥 Cinematographer & Editor
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-200">
                  📡 Live Broadcast Producer
                </span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Behind-the-scenes production breakdowns, DaVinci Resolve color grades, aerial drone reels, and day-in-the-life moments directing live multi-cam crews.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-pink-400 font-semibold">PERSONAL CREATOR HANDLE</span>
              <span className="group-hover:text-white transition-colors font-semibold">
                View Instagram Profile →
              </span>
            </div>
          </motion.a>

          <motion.a
            href="https://www.instagram.com/_tonyshotit/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative bg-zinc-950 border border-zinc-800/90 hover:border-sky-500/50 rounded-2xl p-6 sm:p-8 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-sky-500 to-cyan-300 shrink-0">
                    <div className="w-full h-full rounded-full bg-white p-2 flex items-center justify-center">
                      <img
                        src="/tony_white.png"
                        alt="Tonyshotit Studios"
                        className="w-full h-full object-contain filter brightness-0"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        @_tonyshotit
                      </h2>
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Tonyshotit Studios • Official Page</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-bold tracking-wider uppercase group-hover:scale-105 transition-transform">
                  <Instagram className="w-3.5 h-3.5" />
                  Studio IG
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-sky-300">
                  <Radio className="w-3 h-3 inline mr-1" /> Enterprise Livestreams
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-amber-300">
                  <Film className="w-3 h-3 inline mr-1" /> Commercial Campaigns
                </span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Official studio showcase featuring client deliverables, institutional event coverage, multi-camera broadcast setups, and production announcements.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-sky-400 font-semibold">OFFICIAL STUDIO HANDLE</span>
              <span className="group-hover:text-white transition-colors font-semibold">
                Explore Studio Feed →
              </span>
            </div>
          </motion.a>
        </div>

        {/* FEATURED VERTICAL REELS PREVIEW */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 block mb-1">
                9:16 VERTICAL SHOWCASE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Featured Reels & Set Highlights
              </h2>
            </div>
            <a
              href="https://www.instagram.com/_anthony_i_/reels/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-400 hover:text-pink-300 transition-colors"
            >
              Watch More Reels on Instagram <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reelsList.map((reel, idx) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <VideoPlayer src={reel.videoSrc} poster="" isVertical={true} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                    {reel.tag}
                  </span>
                  <h3 className="text-base font-black text-white mt-1 mb-1.5">
                    {reel.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {reel.caption}
                  </p>
                </div>

                <a
                  href={reel.igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    Connect on Instagram
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* UNDERSTATED SECONDARY PLATFORMS BAR */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <span className="font-mono uppercase tracking-widest text-[11px]">
            Other Platforms & Archives:
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://www.threads.net/@_anthony_i_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <AtSign className="w-3.5 h-3.5" /> Threads (@_anthony_i_)
            </a>
            <a
              href="https://youtube.com/@tony_shotit?si=BDPpqC8dbZIHAARQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" /> YouTube
            </a>
            <a
              href="https://www.tiktok.com/@_tonyshotit?_r=1&_t=ZS-93ZWYqnhTzY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <Music className="w-3.5 h-3.5" /> TikTok
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Socials;