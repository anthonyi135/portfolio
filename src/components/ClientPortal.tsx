import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface VideoStream {
  title: string;
  url: string;
}

interface Project {
  id: string;
  client_name: string;
  project_title: string;
  slug: string;
  pin: string;
  passcode?: string;
  video_url?: string;
  videos?: VideoStream[];
  download_url?: string;
  director_notes?: string;
}

// Helper to extract Google Drive File ID from any Drive link format
const getDriveEmbedUrl = (url: string): string | null => {
  if (!url || !url.includes('drive.google.com')) return null;

  // Match /file/d/FILE_ID/ or id=FILE_ID
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
};

export const ClientPortal: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err: any) {
      console.error('Error fetching project:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = project?.pin || project?.passcode;
    if (project && inputPin === validPin) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Access PIN');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-gray-500 pt-20">
        Loading deliverable gallery...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-red-400 pt-20">
        Deliverable link not found.
      </div>
    );
  }

  // PIN LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 pt-28">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-3xl mb-4">🔒</div>
          <h2 className="text-white text-xl font-bold mb-2 tracking-wider uppercase">
            PAU ACCESS PORTAL
          </h2>
          <p className="text-gray-400 text-xs mb-6 uppercase tracking-wider">
            ENTER PIN TO ACCESS DELIVERABLES
          </p>

          <form onSubmit={handleUnlock}>
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              placeholder="• • • •"
              className="w-full p-3 bg-black border border-gray-800 rounded-lg color-white text-center tracking-[0.5em] text-xl mb-4 focus:outline-none focus:border-blue-500"
            />
            {errorMsg && <p className="text-red-400 text-xs mb-4">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors uppercase text-sm tracking-wider"
            >
              UNLOCK GALLERY
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Handle fallback videos list
  const videoList: VideoStream[] =
    Array.isArray(project.videos) && project.videos.length > 0
      ? project.videos
      : [{ title: 'Main Stream', url: project.video_url || '' }];

  const currentVideo = videoList[selectedVideoIndex] || videoList[0];
  const driveEmbedUrl = currentVideo?.url ? getDriveEmbedUrl(currentVideo.url) : null;

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-16 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* HEADER INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1 block">
            {project.client_name}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight break-words">
            {project.project_title}
          </h1>
        </div>

        {project.download_url && (
          <a
            href={project.download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold text-xs tracking-wider hover:bg-gray-200 transition-all shadow-lg uppercase"
          >
            📥 DOWNLOAD DELIVERABLES
          </a>
        )}
      </div>

      {/* MULTI-VIDEO SELECTION TABS */}
      {videoList.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
          {videoList.map((vid, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVideoIndex(idx)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedVideoIndex === idx
                  ? 'bg-white text-black shadow-md'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
            >
              {vid.title || `Video ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* MAIN VIDEO PLAYER CONTAINER */}
      <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl mb-8 p-4 flex flex-col items-center justify-center min-h-[220px]">
        {driveEmbedUrl ? (
          <div className="w-full flex flex-col items-center justify-center gap-4 py-8">
            <p className="text-gray-400 text-sm text-center px-4">
              Tap below to view full-screen video with complete playback controls:
            </p>
            <a
              href={currentVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-500 transition-all shadow-lg uppercase tracking-wider"
            >
              ▶ OPEN IN FULLSCREEN PLAYER
            </a>
          </div>
        ) : currentVideo?.url ? (
          <div className="w-full aspect-video">
            <video
              key={currentVideo.url}
              controls
              playsInline
              className="w-full h-full object-contain block"
            >
              <source src={currentVideo.url} type="video/mp4" />
              Your browser does not support playing this video directly.
            </video>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm p-8">
            No valid video stream URL available for this selection.
          </div>
        )}
      </div>

      {/* DIRECTOR NOTES SECTION */}
      {project.director_notes && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            DIRECTOR NOTES
          </h3>
          <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
            {project.director_notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;