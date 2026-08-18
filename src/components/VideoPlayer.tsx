import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isGoogleDriveUrl(url: string) {
  return /drive\.google\.com/.test(url);
}

function getGoogleDriveEmbedUrl(url: string) {
  if (url.includes('/preview')) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showIframe, setShowIframe] = useState(false);

  const togglePlay = () => {
    if (isYouTubeUrl(src) || isGoogleDriveUrl(src)) {
      setShowIframe(true);
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // 1. GOOGLE DRIVE EMBED
  if (isGoogleDriveUrl(src)) {
    if (!showIframe) {
      return (
        <div 
          className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group border border-gray-800" 
          onClick={togglePlay}
        >
          {poster ? (
            <img src={poster} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <span className="text-gray-600 text-xs tracking-widest uppercase">Click To Play Stream</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="bg-blue-600 rounded-full p-4 sm:p-5 shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-800">
        <iframe
          src={getGoogleDriveEmbedUrl(src)}
          title="Google Drive video player"
          allow="autoplay; fullscreen"
          className="w-full h-full rounded-lg border-0"
        />
      </div>
    );
  }

  // 2. YOUTUBE EMBED
  if (isYouTubeUrl(src)) {
    if (!showIframe && poster) {
      return (
        <div 
          className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group border border-gray-800" 
          onClick={togglePlay}
        >
          <img src={poster} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="bg-blue-600 rounded-full p-4 sm:p-5 shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
            </span>
          </div>
        </div>
      );
    }

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

  // 3. DIRECT MP4 / NATIVE VIDEO FALLBACK
  return (
    <div
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer border border-gray-800"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
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
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl hover:bg-blue-500 transition-colors"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
              </motion.button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              <div className="flex-1"></div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
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