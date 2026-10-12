import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isVertical?: boolean;
}

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, isVertical }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Playback error:', err));
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
    }
  };

  // 1. YouTube Live Embed
  if (isYouTubeUrl(src)) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
        <iframe
          src={src}
          title="Live Broadcast Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // 2. Native HTML5 Video
  return (
    <div
      className={`relative w-full ${
        isVertical ? 'aspect-[9/16] max-h-[520px]' : 'aspect-video'
      } bg-zinc-950 rounded-xl overflow-hidden group border border-zinc-800/80 shadow-2xl flex items-center justify-center cursor-pointer`}
      onClick={togglePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        webkit-playsinline="true"
        muted={isMuted}
        preload="metadata"
        className="w-full h-full object-contain pointer-events-none"
        onEnded={() => setIsPlaying(false)}
      />

      {/* Center Big Play Button */}
      {!isPlaying && (
        <motion.button
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={togglePlay}
          className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform"
        >
          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-black ml-1" />
        </motion.button>
      )}

      {/* Bottom Floating Control Bar */}
      <AnimatePresence>
        {(isHovered || !isPlaying) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between z-20"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="text-white hover:text-sky-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="text-white hover:text-sky-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-white hover:text-sky-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;