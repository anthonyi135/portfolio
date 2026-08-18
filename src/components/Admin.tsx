import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface VideoStream {
  title: string;
  url: string;
}

interface Project {
  id?: string;
  client_name: string;
  project_title: string;
  slug: string;
  pin: string;
  videos: VideoStream[];
  download_url: string;
  director_notes: string;
  created_at?: string;
}

// MASTER ADMIN PASSCODE UPDATED TO 1472
const MASTER_ADMIN_PIN = '1472';

export const Admin: React.FC = () => {
  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Project Management States
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [pin, setPin] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [videos, setVideos] = useState<VideoStream[]>([{ title: 'Main Stream', url: '' }]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchProjects();
    }
  }, [isAdminAuthenticated]);

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === MASTER_ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin Passcode');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err.message);
    }
  };

  const handleAddVideoField = () => {
    setVideos([...videos, { title: `Video ${videos.length + 1}`, url: '' }]);
  };

  const handleRemoveVideoField = (index: number) => {
    if (videos.length === 1) return;
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };

  const resetForm = () => {
    setEditingId(null);
    setClientName('');
    setProjectTitle('');
    setSlug('');
    setPin('');
    setDownloadUrl('');
    setDirectorNotes('');
    setVideos([{ title: 'Main Stream', url: '' }]);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id || null);
    setClientName(project.client_name || '');
    setProjectTitle(project.project_title || '');
    setSlug(project.slug || '');
    setPin(project.pin || '');
    setDownloadUrl(project.download_url || '');
    setDirectorNotes(project.director_notes || '');

    if (Array.isArray(project.videos) && project.videos.length > 0) {
      setVideos(project.videos);
    } else if ((project as any).video_url) {
      setVideos([{ title: 'Main Stream', url: (project as any).video_url }]);
    } else {
      setVideos([{ title: 'Main Stream', url: '' }]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gallery?')) return;
    try {
      const { error } = await supabase.from('client_projects').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Gallery deleted successfully!' });
      fetchProjects();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const payload = {
      client_name: clientName,
      project_title: projectTitle,
      slug,
      pin,
      videos,
      video_url: videos[0]?.url || '',
      download_url: downloadUrl,
      director_notes: directorNotes,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('client_projects').update(payload).eq('id', editingId);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Gallery updated successfully!' });
      } else {
        const { error } = await supabase.from('client_projects').insert([payload]);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Gallery published successfully!' });
      }

      resetForm();
      fetchProjects();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 1. ADMIN LOCK SCREEN IF NOT AUTHENTICATED
  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔑</div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>
            ADMIN STUDIO LOCK
          </h2>
          <p style={{ color: '#666', fontSize: '12px', marginBottom: '24px' }}>ENTER MASTER PASSCODE TO MANAGE GALLERIES</p>

          <form onSubmit={handleAdminUnlock}>
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
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
            {pinError && <p style={{ color: '#f88', fontSize: '12px', marginBottom: '16px' }}>{pinError}</p>}
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
              ACCESS DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED DASHBOARD
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>CLIENT GALLERY STUDIO</h1>
          <p style={{ color: '#888', margin: 0 }}>
            {editingId ? 'EDIT EXISTING CLIENT GALLERY' : 'CREATE A NEW PRIVATE DELIVERABLE LINK'}
          </p>
        </div>
        <button
          onClick={() => setIsAdminAuthenticated(false)}
          style={{ padding: '8px 16px', backgroundColor: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          🔒 Lock Dashboard
        </button>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            backgroundColor: statusMsg.type === 'success' ? '#14532d' : '#7f1d1d',
            color: '#fff',
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#111', padding: '24px', borderRadius: '8px', border: '1px solid #222' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>CLIENT NAME</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Nike"
              style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>PROJECT TITLE</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Summer Campaign"
              style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>URL SLUG</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. nike-summer-v1"
              style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>CLIENT ACCESS PIN</label>
            <input
              type="text"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="9999"
              style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* DYNAMIC VIDEO STREAMS */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid #222', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>VIDEO STREAMS ({videos.length})</label>
            <button
              type="button"
              onClick={handleAddVideoField}
              style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add Another Video
            </button>
          </div>

          {videos.map((vid, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Video Title (e.g. Main Cut)"
                value={vid.title}
                onChange={(e) => handleVideoChange(idx, 'title', e.target.value)}
                style={{ width: '30%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Video Stream URL (https://...)"
                value={vid.url}
                onChange={(e) => handleVideoChange(idx, 'url', e.target.value)}
                style={{ width: '60%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              />
              {videos.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVideoField(idx)}
                  style={{ padding: '10px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>DOWNLOAD FILE URL (FULL RESOLUTION)</label>
          <input
            type="text"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>DIRECTOR NOTES (OPTIONAL)</label>
          <textarea
            rows={3}
            value={directorNotes}
            onChange={(e) => setDirectorNotes(e.target.value)}
            placeholder="Notes regarding color grade, sound mix, or revisions..."
            style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#fff',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'SAVING...' : editingId ? 'UPDATE CLIENT GALLERY' : 'PUBLISH CLIENT GALLERY'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '12px 20px',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      </form>

      {/* PUBLISHED GALLERIES LIST */}
      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
          PUBLISHED GALLERIES ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p style={{ color: '#666' }}>No published galleries found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj) => (
              <div
                key={proj.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#111',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #222',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>
                    {proj.client_name} - {proj.project_title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                    Slug: <code style={{ color: '#aaa' }}>/client/{proj.slug}</code> | PIN: {proj.pin} | Videos: {proj.videos?.length || 1}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a
                    href={`/client/${proj.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #0284c7',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    View Gallery ↗
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/client/${proj.slug}`);
                      alert('Gallery link copied to clipboard!');
                    }}
                    style={{ padding: '6px 12px', backgroundColor: '#222', color: '#ccc', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Copy Link
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(proj)}
                    style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id!)}
                    style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;