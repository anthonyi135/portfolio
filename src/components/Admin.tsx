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

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Invoice {
  id?: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  project_for?: string;
  issue_date: string;
  due_date: string;
  currency: string;
  status: 'Draft' | 'Sent' | 'Paid';
  items: InvoiceItem[];
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  notes: string;
  created_at?: string;
}

const MASTER_ADMIN_PIN = '1472';

export const Admin: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'galleries' | 'invoices'>('galleries');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gallery States
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [pin, setPin] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [videos, setVideos] = useState<VideoStream[]>([{ title: 'Main Stream', url: '' }]);

  // Invoice States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invNumber, setInvNumber] = useState(`TS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`);
  const [invClientName, setInvClientName] = useState('');
  const [invClientEmail, setInvClientEmail] = useState('');
  const [invProjectFor, setInvProjectFor] = useState('');
  const [invIssueDate, setInvIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState('');
  const [invCurrency, setInvCurrency] = useState('NGN');
  const [invStatus, setInvStatus] = useState<'Draft' | 'Sent' | 'Paid'>('Sent');
  const [invBankName, setInvBankName] = useState('Parallex Bank');
  const [invAccountNumber, setInvAccountNumber] = useState('1118039765');
  const [invAccountName, setInvAccountName] = useState('Anthony Ibuzo');
  const [invItems, setInvItems] = useState<InvoiceItem[]>([{ description: 'Cinematography Day Rate', quantity: 1, rate: 0 }]);
  const [invNotes, setInvNotes] = useState('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchProjects();
      fetchInvoices();
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
      const { data, error } = await supabase.from('client_projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err.message);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setInvoices(data);
    } catch (err: any) {
      console.error('Error fetching invoices:', err.message);
    }
  };

  const resetGalleryForm = () => {
    setEditingProjectId(null);
    setClientName('');
    setProjectTitle('');
    setSlug('');
    setPin('');
    setDownloadUrl('');
    setDirectorNotes('');
    setVideos([{ title: 'Main Stream', url: '' }]);
  };

  const handleEditProject = (proj: Project) => {
    setEditingProjectId(proj.id || null);
    setClientName(proj.client_name || '');
    setProjectTitle(proj.project_title || '');
    setSlug(proj.slug || '');
    setPin(proj.pin || '');
    setDownloadUrl(proj.download_url || '');
    setDirectorNotes(proj.director_notes || '');
    setVideos(Array.isArray(proj.videos) && proj.videos.length > 0 ? proj.videos : [{ title: 'Main Stream', url: (proj as any).video_url || '' }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Delete this gallery link?')) return;
    try {
      const { error } = await supabase.from('client_projects').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Gallery deleted!' });
      fetchProjects();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      if (editingProjectId) {
        const { error } = await supabase.from('client_projects').update(payload).eq('id', editingProjectId);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Gallery updated!' });
      } else {
        const { error } = await supabase.from('client_projects').insert([payload]);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Gallery published!' });
      }
      resetGalleryForm();
      fetchProjects();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoiceId(inv.id || null);
    setInvNumber(inv.invoice_number);
    setInvClientName(inv.client_name);
    setInvClientEmail(inv.client_email || '');
    setInvProjectFor(inv.project_for || '');
    setInvIssueDate(inv.issue_date);
    setInvDueDate(inv.due_date);
    setInvCurrency(inv.currency || 'NGN');
    setInvStatus(inv.status || 'Sent');
    setInvBankName(inv.bank_name || 'Parallex Bank');
    setInvAccountNumber(inv.account_number || '1118039765');
    setInvAccountName(inv.account_name || 'Anthony Ibuzo');
    setInvItems(inv.items || [{ description: '', quantity: 1, rate: 0 }]);
    setInvNotes(inv.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Invoice deleted!' });
      fetchInvoices();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      invoice_number: invNumber,
      client_name: invClientName,
      client_email: invClientEmail,
      project_for: invProjectFor,
      issue_date: invIssueDate,
      due_date: invDueDate,
      currency: invCurrency,
      status: invStatus,
      bank_name: invBankName,
      account_number: invAccountNumber,
      account_name: invAccountName,
      items: invItems,
      notes: invNotes,
    };

    try {
      if (editingInvoiceId) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', editingInvoiceId);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Invoice updated!' });
      } else {
        const { error } = await supabase.from('invoices').insert([payload]);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Invoice saved!' });
      }
      fetchInvoices();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const invoiceSubtotal = invItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
  const currencySymbol = invCurrency === 'NGN' ? 'NGN ' : invCurrency === 'GBP' ? '£ ' : invCurrency === 'EUR' ? '€ ' : '$ ';

  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔑</div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>ADMIN STUDIO LOCK</h2>
          <form onSubmit={handleAdminUnlock}>
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="• • • •"
              style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', textAlign: 'center', fontSize: '1.2rem', marginBottom: '16px' }}
            />
            {pinError && <p style={{ color: '#f88', fontSize: '12px', marginBottom: '16px' }}>{pinError}</p>}
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              ACCESS STUDIO
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      {/* HEADER & TABS */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '1px' }}>TONYSHOTIT STUDIO</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>MANAGEMENT DASHBOARD</p>
        </div>
        <button onClick={() => setIsAdminAuthenticated(false)} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          🔒 Lock Studio
        </button>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '32px' }}>
        <button onClick={() => setActiveTab('galleries')} style={{ padding: '10px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'galleries' ? '#fff' : '#111', color: activeTab === 'galleries' ? '#000' : '#888', border: '1px solid #333' }}>
          🎬 Galleries
        </button>
        <button onClick={() => setActiveTab('invoices')} style={{ padding: '10px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'invoices' ? '#fff' : '#111', color: activeTab === 'invoices' ? '#000' : '#888', border: '1px solid #333' }}>
          🧾 Invoice Builder
        </button>
      </div>

      {statusMsg && (
        <div className="no-print" style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', backgroundColor: statusMsg.type === 'success' ? '#14532d' : '#7f1d1d', color: '#fff', fontSize: '13px' }}>
          {statusMsg.text}
        </div>
      )}

      {/* GALLERIES TAB (RESTORED ORIGINAL LAYOUT) */}
      {activeTab === 'galleries' && (
        <div className="no-print">
          <form onSubmit={handleGallerySubmit} style={{ backgroundColor: '#111', padding: '24px', borderRadius: '8px', border: '1px solid #222', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>
              {editingProjectId ? 'EDIT CLIENT GALLERY' : 'CREATE NEW CLIENT GALLERY'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>CLIENT NAME</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. RedBull" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>PROJECT TITLE</label>
                <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. BMX Showcase Cut" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>URL SLUG</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. redbull-bmx-v1" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>ACCESS PIN</label>
                <input type="text" required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="1234" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* DYNAMIC VIDEO STREAMS */}
            <div style={{ marginBottom: '24px', borderTop: '1px solid #222', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold' }}>VIDEO STREAMS ({videos.length})</label>
                <button type="button" onClick={() => setVideos([...videos, { title: `Video ${videos.length + 1}`, url: '' }])} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>
                  + Add Video
                </button>
              </div>

              {videos.map((vid, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Title (e.g. Main Stream)" value={vid.title} onChange={(e) => { const updated = [...videos]; updated[idx].title = e.target.value; setVideos(updated); }} style={{ width: '30%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  <input type="text" placeholder="Drive or MP4 URL" value={vid.url} onChange={(e) => { const updated = [...videos]; updated[idx].url = e.target.value; setVideos(updated); }} style={{ width: '60%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  {videos.length > 1 && (
                    <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== idx))} style={{ padding: '10px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>DOWNLOAD URL (FULL RESOLUTION ZIP/RAW)</label>
              <input type="text" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>DIRECTOR NOTES</label>
              <textarea rows={3} value={directorNotes} onChange={(e) => setDirectorNotes(e.target.value)} placeholder="Notes for client regarding color grade, sound mix, or revisions..." style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'SAVING...' : editingProjectId ? 'UPDATE GALLERY' : 'PUBLISH GALLERY'}
              </button>
              {editingProjectId && (
                <button type="button" onClick={resetGalleryForm} style={{ padding: '12px 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  CANCEL
                </button>
              )}
            </div>
          </form>

          {/* PUBLISHED GALLERIES LIST */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
            PUBLISHED GALLERIES ({projects.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '16px', borderRadius: '6px', border: '1px solid #222' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>{proj.client_name} - {proj.project_title}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Slug: <code style={{ color: '#aaa' }}>/client/{proj.slug}</code> | PIN: {proj.pin} | Videos: {proj.videos?.length || 1}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a href={`/client/${proj.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
                    View ↗
                  </a>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/client/${proj.slug}`); alert('Link copied!'); }} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#ccc', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Copy Link</button>
                  <button type="button" onClick={() => handleEditProject(proj)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteProject(proj.id!)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div>
          {/* EDITOR CONTROLS (NO PRINT) */}
          <div className="no-print" style={{ backgroundColor: '#111', padding: '24px', borderRadius: '8px', border: '1px solid #222', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>INVOICE CREATOR & EDITOR</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>INVOICE NUMBER</label>
                <input type="text" value={invNumber} onChange={(e) => setInvNumber(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>ISSUE DATE</label>
                <input type="date" value={invIssueDate} onChange={(e) => setInvIssueDate(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>DUE DATE</label>
                <input type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CLIENT / COMPANY</label>
                <input type="text" placeholder="Client Name" value={invClientName} onChange={(e) => setInvClientName(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CLIENT EMAIL</label>
                <input type="email" placeholder="client@email.com" value={invClientEmail} onChange={(e) => setInvClientEmail(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>FOR (PROJECT / EVENT)</label>
                <input type="text" placeholder="e.g. THE ELEVATION CHURCH" value={invProjectFor} onChange={(e) => setInvProjectFor(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CURRENCY</label>
                <select value={invCurrency} onChange={(e) => setInvCurrency(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>STATUS</label>
                <select value={invStatus} onChange={(e) => setInvStatus(e.target.value as any)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>BANK NAME</label>
                <input type="text" value={invBankName} onChange={(e) => setInvBankName(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>ACCOUNT NO.</label>
                <input type="text" value={invAccountNumber} onChange={(e) => setInvAccountNumber(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* DYNAMIC LINE ITEMS */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>LINE ITEMS</label>
              {invItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => { const updated = [...invItems]; updated[idx].description = e.target.value; setInvItems(updated); }} style={{ flex: 3, padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => { const updated = [...invItems]; updated[idx].quantity = parseFloat(e.target.value) || 0; setInvItems(updated); }} style={{ flex: 1, padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  <input type="number" placeholder="Rate" value={item.rate} onChange={(e) => { const updated = [...invItems]; updated[idx].rate = parseFloat(e.target.value) || 0; setInvItems(updated); }} style={{ flex: 1, padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  {invItems.length > 1 && (
                    <button type="button" onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))} style={{ padding: '8px 12px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px' }}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setInvItems([...invItems, { description: '', quantity: 1, rate: 0 }])} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>
                + Add Item
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={handleInvoiceSubmit} disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'SAVING...' : editingInvoiceId ? 'UPDATE INVOICE' : 'SAVE INVOICE'}
              </button>
              <button type="button" onClick={() => window.print()} style={{ padding: '12px 24px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                🖨️ PRINT / DOWNLOAD PDF
              </button>
            </div>
          </div>

          {/* PRINTABLE INVOICE TEMPLATE */}
          <div id="printable-invoice-document" style={{ backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '1px', margin: 0, color: '#000' }}>INVOICE</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#333' }}>
                  <strong>Invoice No:</strong> {invNumber}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#333' }}>
                  <strong>Date:</strong> {invIssueDate}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, letterSpacing: '2px', color: '#000' }}>TONYSHOTIT</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>tony.shotit17@gmail.com</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>www.tonyshotit.xyz</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #000', marginBottom: '16px' }} />

            <p style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '24px', color: '#333' }}>
              Thank you for choosing Tonyshotit Studio – Professional Video & Broadcast Solutions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '28px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', margin: '0 0 4px 0' }}>FROM</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#000' }}>Tonyshotit Studio</p>
                <p style={{ fontSize: '12px', color: '#333', margin: '2px 0 0 0' }}>Sales Rep: Anthony Ibuzo</p>
                <p style={{ fontSize: '12px', color: '#333', margin: '2px 0 0 0' }}>tony.shotit17@gmail.com</p>
                <p style={{ fontSize: '12px', color: '#333', margin: '2px 0 0 0' }}>www.tonyshotit.xyz</p>
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', margin: '0 0 4px 0' }}>BILL TO</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#000' }}>{invClientName || 'Client Name'}</p>
                {invClientEmail && <p style={{ fontSize: '12px', color: '#333', margin: '2px 0 0 0' }}>{invClientEmail}</p>}
                {invProjectFor && <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '6px 0 0 0' }}>For: {invProjectFor}</p>}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000', textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}>
                  <th style={{ padding: '8px 4px', color: '#000' }}>#</th>
                  <th style={{ padding: '8px 4px', color: '#000' }}>ITEM DESCRIPTION</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', color: '#000' }}>QTY</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right', color: '#000' }}>UNIT PRICE</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right', color: '#000' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd', fontSize: '12px' }}>
                    <td style={{ padding: '10px 4px', color: '#333' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 'bold', color: '#000' }}>{item.description || 'Service Line Item'}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#333' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', color: '#333' }}>{currencySymbol}{(item.rate || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>{currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
              <div style={{ width: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                  <span style={{ fontWeight: 'bold' }}>Subtotal</span>
                  <span>{currencySymbol}{invoiceSubtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', padding: '8px 0', borderBottom: '2px solid #000' }}>
                  <span>GRAND TOTAL</span>
                  <span>{currencySymbol}{invoiceSubtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #000', paddingTop: '16px', fontSize: '12px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: '#000', textTransform: 'uppercase' }}>PAYMENT DETAILS</p>
                <p style={{ margin: '2px 0', color: '#333' }}>Bank Name: <strong>{invBankName}</strong></p>
                <p style={{ margin: '2px 0', color: '#333' }}>Account Number: <strong>{invAccountNumber}</strong></p>
                <p style={{ margin: '2px 0', color: '#333' }}>Account Name: <strong>{invAccountName}</strong></p>
              </div>

              <div>
                <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: '#000', textTransform: 'uppercase' }}>NOTES</p>
                <p style={{ margin: 0, color: '#444', lineHeight: '1.4' }}>{invNotes}</p>
              </div>
            </div>
          </div>

          {/* SAVED INVOICES LIST (NO PRINT) */}
          <div className="no-print" style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
              SAVED INVOICES ({invoices.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '16px', borderRadius: '6px', border: '1px solid #222' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>{inv.invoice_number} - {inv.client_name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Date: {inv.issue_date} | Status: {inv.status}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditInvoice(inv)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteInvoice(inv.id!)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;