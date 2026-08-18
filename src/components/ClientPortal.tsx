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
  video_url?: string;
  videos?: VideoStream[];
  download_url?: string;
  director_notes?: string;
}

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
    if (project && inputPin === project.pin) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Access PIN');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Loading deliverable gallery...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f88' }}>
        Deliverable link not found.
      </div>
    );
  }

  // PIN LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>
            PAU ACCESS PORTAL
          </h2>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '24px' }}>ENTER PIN TO ACCESS DELIVERABLES</p>

          <form onSubmit={handleUnlock}>
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              placeholder="• • • •"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                textAlign: 'center',
                letterSpacing: '4px',
                fontSize: '1.2rem',
                marginBottom: '16px',
              }}
            />
            {errorMsg && <p style={{ color: '#f88', fontSize: '12px', marginBottom: '16px' }}>{errorMsg}</p>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      {/* HEADER INFO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>{project.client_name}</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {project.project_title}
          </h1>
        </div>
        {project.download_url && (
          <a
            href={project.download_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 18px',
              backgroundColor: '#fff',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            📥 DOWNLOAD DELIVERABLES
          </a>
        )}
      </div>

      {/* MULTI-VIDEO SELECTION TABS */}
      {videoList.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
          {videoList.map((vid, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVideoIndex(idx)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: selectedVideoIndex === idx ? '#fff' : '#111',
                color: selectedVideoIndex === idx ? '#000' : '#aaa',
                border: selectedVideoIndex === idx ? '1px solid #fff' : '1px solid #333',
                transition: 'all 0.2s ease',
              }}
            >
              {vid.title || `Video ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* MAIN VIDEO PLAYER */}
      <div
        style={{
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #222',
          marginBottom: '32px',
          width: '100%',
          aspectRatio: '16 / 9',
        }}
      >
        {currentVideo?.url ? (
          <video
            key={currentVideo.url}
            controls
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          >
            <source src={currentVideo.url} type="video/mp4" />
            Your browser does not support playing this video directly.
          </video>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            No valid video stream URL available for this selection.
          </div>
        )}
      </div>

      {/* DIRECTOR NOTES SECTION */}
      {project.director_notes && (
        <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>
            DIRECTOR NOTES
          </h3>
          <p style={{ margin: 0, color: '#ccc', lineHeight: '1.6', fontSize: '14px' }}>{project.director_notes}</p>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;