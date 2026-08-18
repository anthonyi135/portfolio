import { useState, useRef } from 'react';
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

const VideoPlayer = ({ src, poster, isVertical }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.log("Playback error on mobile:", err);
            });
        }
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
        // iOS Chrome/Safari native fullscreen fallback
        (videoRef.current as any).webkitEnterFullscreen();
      }
    }
  };

  // 1. YOUTUBE EMBED (For Live Broadcasts)
  if (isYouTubeUrl(src)) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-800">
        <iframe
          src={src}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg border-0"
        />
      </div>
    );
  }

  // 2. HTML5 NATIVE VIDEO PLAYER (Mobile WebKit Compatible)
  return (
    <div
      className={`relative w-full ${
        isVertical ? 'aspect-[9/16] max-h-[500px]' : 'aspect-video'
      } bg-black/90 rounded-lg overflow-hidden group border border-gray-800 flex items-center justify-center`}
      onClick={(e) => togglePlay(e)}
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

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center"
          >
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => togglePlay(e)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl hover:bg-blue-500 transition-colors z-20"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
              </motion.button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3 z-20">
              <button
                onClick={(e) => togglePlay(e)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={(e) => toggleMute(e)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              <div className="flex-1"></div>

              <button
                onClick={(e) => toggleFullscreen(e)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;