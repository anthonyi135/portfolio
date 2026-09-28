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
  sub_description?: string;
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
  discount?: number;
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
  const [activeTab, setActiveTab] = useState<'galleries' | 'invoices'>('invoices');
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
  const [invBankName, setInvBankName] = useState('GT Bank');
  const [invAccountNumber, setInvAccountNumber] = useState('0430859996');
  const [invAccountName, setInvAccountName] = useState('Anthony Ibuzo');
  const [invDiscount, setInvDiscount] = useState<number>(0);
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { description: 'Service Line Item', sub_description: '', quantity: 1, rate: 0 }
  ]);
  const [invNotes, setInvNotes] = useState('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');
  const [includeTerms, setIncludeTerms] = useState(true);

  // Contract Customization States
  const [contractTitle, setContractTitle] = useState('EQUIPMENT RENTAL & PRODUCTION SERVICES AGREEMENT');
  const [contractScope, setContractScope] = useState('Equipment supply, hardware deployment, logistics, and technical audio/visual support as itemized in the attached invoice.');
  const [contractDeliverables, setContractDeliverables] = useState('On-site delivery, hardware rigging/operation, and full technical execution for the duration of the event.');
  const [depositPercent, setDepositPercent] = useState<number>(70);
  const [includeEquipmentSafety, setIncludeEquipmentSafety] = useState(true);
  const [contractCustomTerms, setContractCustomTerms] = useState('Client guarantees secure overnight hold, stable uninterrupted generator power, and full liability for any physical damage caused by event attendees.');
  const [contractSignerName, setContractSignerName] = useState('');

  // Print Mode State ('invoice' or 'contract')
  const [printDocumentMode, setPrintDocumentMode] = useState<'invoice' | 'contract'>('invoice');

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
    setInvDueDate(inv.due_date || '');
    setInvCurrency(inv.currency || 'NGN');
    setInvStatus(inv.status || 'Sent');
    setInvBankName(inv.bank_name || 'GT Bank');
    setInvAccountNumber(inv.account_number || '0430859996');
    setInvAccountName(inv.account_name || 'Anthony Ibuzo');
    setInvDiscount(inv.discount || 0);
    setInvItems(
      inv.items && inv.items.length > 0
        ? inv.items.map(item => ({ ...item, sub_description: item.sub_description || '' }))
        : [{ description: '', sub_description: '', quantity: 1, rate: 0 }]
    );
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
      discount: invDiscount || 0,
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
  const discountAmount = Math.max(0, invDiscount || 0);
  const invoiceGrandTotal = Math.max(0, invoiceSubtotal - discountAmount);

  const safeDepositPercent = Math.min(100, Math.max(0, depositPercent || 70));
  const depositAmount = Math.round(invoiceGrandTotal * (safeDepositPercent / 100));
  const balanceAmount = invoiceGrandTotal - depositAmount;

  const currencySymbol = invCurrency === 'NGN' ? 'NGN ' : invCurrency === 'GBP' ? '£ ' : invCurrency === 'EUR' ? '€ ' : '$ ';

  const triggerPrintInvoice = () => {
    setPrintDocumentMode('invoice');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const triggerPrintContract = () => {
    setPrintDocumentMode('contract');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px 24px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 14px', color: '#fff' }}>
      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>TONYSHOTIT STUDIO</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '11px' }}>MANAGEMENT DASHBOARD</p>
        </div>
        <button onClick={() => setIsAdminAuthenticated(false)} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          🔒 Lock Studio
        </button>
      </div>

      {/* TOP TABS */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('invoices')} style={{ flex: '1 1 auto', minWidth: '150px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'invoices' ? '#fff' : '#111', color: activeTab === 'invoices' ? '#000' : '#888', border: '1px solid #333' }}>
          🧾 Invoice & Agreement Builder
        </button>
        <button onClick={() => setActiveTab('galleries')} style={{ flex: '1 1 auto', minWidth: '120px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'galleries' ? '#fff' : '#111', color: activeTab === 'galleries' ? '#000' : '#888', border: '1px solid #333' }}>
          🎬 Galleries
        </button>
      </div>

      {statusMsg && (
        <div className="no-print" style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: statusMsg.type === 'success' ? '#14532d' : '#7f1d1d', color: '#fff', fontSize: '13px' }}>
          {statusMsg.text}
        </div>
      )}

      {/* GALLERIES TAB */}
      {activeTab === 'galleries' && (
        <div className="no-print">
          <form onSubmit={handleGallerySubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px' }}>
              {editingProjectId ? 'EDIT CLIENT GALLERY' : 'CREATE NEW CLIENT GALLERY'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>CLIENT NAME</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. RedBull" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>PROJECT TITLE</label>
                <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Showcase Cut" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>URL SLUG</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. showcase-v1" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>ACCESS PIN</label>
                <input type="text" required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="1234" style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px', borderTop: '1px solid #222', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold' }}>VIDEO STREAMS ({videos.length})</label>
                <button type="button" onClick={() => setVideos([...videos, { title: `Video ${videos.length + 1}`, url: '' }])} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>
                  + Add Video
                </button>
              </div>

              {videos.map((vid, idx) => (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Title" value={vid.title} onChange={(e) => { const updated = [...videos]; updated[idx].title = e.target.value; setVideos(updated); }} style={{ flex: '1 1 120px', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  <input type="text" placeholder="Video URL" value={vid.url} onChange={(e) => { const updated = [...videos]; updated[idx].url = e.target.value; setVideos(updated); }} style={{ flex: '2 1 180px', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  {videos.length > 1 && (
                    <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== idx))} style={{ padding: '8px 12px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>DOWNLOAD URL (ZIP/RAW)</label>
              <input type="text" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>DIRECTOR NOTES</label>
              <textarea rows={3} value={directorNotes} onChange={(e) => setDirectorNotes(e.target.value)} placeholder="Notes for client..." style={{ width: '100%', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, minWidth: '160px', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'SAVING...' : editingProjectId ? 'UPDATE GALLERY' : 'PUBLISH GALLERY'}
              </button>
              {editingProjectId && (
                <button type="button" onClick={resetGalleryForm} style={{ padding: '12px 18px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  CANCEL
                </button>
              )}
            </div>
          </form>

          {/* PUBLISHED LIST */}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
            PUBLISHED GALLERIES ({projects.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: '6px', border: '1px solid #222', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff' }}>{proj.client_name} - {proj.project_title}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Slug: <code style={{ color: '#aaa' }}>/client/{proj.slug}</code> | PIN: {proj.pin}</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <a href={`/client/${proj.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 10px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>
                    View ↗
                  </a>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/client/${proj.slug}`); alert('Link copied!'); }} style={{ padding: '6px 10px', backgroundColor: '#222', color: '#ccc', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Copy</button>
                  <button type="button" onClick={() => handleEditProject(proj)} style={{ padding: '6px 10px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteProject(proj.id!)} style={{ padding: '6px 10px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVOICES & AGREEMENT TAB */}
      {activeTab === 'invoices' && (
        <div>
          {/* EDITOR CONTROLS (NO PRINT) */}
          <div className="no-print" style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>INVOICE & AGREEMENT BUILDER</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', maxWidth: '420px' }}>
                <button
                  type="button"
                  onClick={() => setPrintDocumentMode('invoice')}
                  style={{
                    flex: '1 1 auto',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: printDocumentMode === 'invoice' ? '#fff' : '#222',
                    color: printDocumentMode === 'invoice' ? '#000' : '#888',
                    border: '1px solid #444'
                  }}
                >
                  👁️ Preview Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setPrintDocumentMode('contract')}
                  style={{
                    flex: '1 1 auto',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: printDocumentMode === 'contract' ? '#38bdf8' : '#222',
                    color: printDocumentMode === 'contract' ? '#000' : '#888',
                    border: '1px solid #444'
                  }}
                >
                  👁️ Agreement Mode
                </button>
              </div>
            </div>

            {/* INVOICE META ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
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

            {/* INVOICE META ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CLIENT / COMPANY</label>
                <input type="text" placeholder="Client Name / Organization" value={invClientName} onChange={(e) => setInvClientName(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CLIENT EMAIL</label>
                <input type="email" placeholder="client@email.com" value={invClientEmail} onChange={(e) => setInvClientEmail(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>FOR (PROJECT / EVENT)</label>
                <input type="text" placeholder="e.g. HARVEST LUNCHEON" value={invProjectFor} onChange={(e) => setInvProjectFor(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* INVOICE META ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
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

            {/* LINE ITEMS */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                LINE ITEMS & SPECIFICATIONS
              </label>
              {invItems.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '6px', border: '1px solid #222', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Line item title (e.g. 12sqm LED Screen Deployment)"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...invItems];
                        updated[idx].description = e.target.value;
                        setInvItems(updated);
                      }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '13px' }}
                    />
                    {invItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))}
                        style={{ padding: '8px 14px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '2px' }}>QTY</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...invItems];
                          updated[idx].quantity = val === '' ? 0 : parseFloat(val) || 0;
                          setInvItems(updated);
                        }}
                        style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '2px' }}>UNIT PRICE ({currencySymbol.trim()})</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.rate === 0 ? '' : item.rate}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...invItems];
                          updated[idx].rate = val === '' ? 0 : parseFloat(val) || 0;
                          setInvItems(updated);
                        }}
                        style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#38bdf8', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Additional details / specs (e.g. includes rigging truss, processors, and cables)"
                    value={item.sub_description || ''}
                    onChange={(e) => {
                      const updated = [...invItems];
                      updated[idx].sub_description = e.target.value;
                      setInvItems(updated);
                    }}
                    style={{ width: '100%', padding: '6px 8px', backgroundColor: '#111', border: '1px solid #222', color: '#888', borderRadius: '4px', fontSize: '11px' }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setInvItems([...invItems, { description: '', sub_description: '', quantity: 1, rate: 0 }])}
                style={{ width: '100%', padding: '10px', fontSize: '12px', backgroundColor: '#18181b', color: '#fff', border: '1px dashed #444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Add Another Line Item
              </button>
            </div>

            {/* DISCOUNT & TERMS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                  DISCOUNT ALLOCATED ({currencySymbol.trim()})
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={invDiscount === 0 ? '' : invDiscount}
                  onChange={(e) => setInvDiscount(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#38bdf8', borderRadius: '4px', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px' }}>
                <input
                  type="checkbox"
                  id="includeTermsCheckbox"
                  checked={includeTerms}
                  onChange={(e) => setIncludeTerms(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38bdf8' }}
                />
                <label htmlFor="includeTermsCheckbox" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer', userSelect: 'none' }}>
                  Include Terms & Conditions on invoice
                </label>
              </div>
            </div>

            {/* AGREEMENT CUSTOMIZATION PANEL WITH EQUIPMENT SAFETY CHECKBOX */}
            {printDocumentMode === 'contract' && (
              <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#18181b', borderRadius: '6px', border: '1px solid #38bdf8' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                  ✍️ Customize Agreement Terms & Signers
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>AGREEMENT TITLE</label>
                    <input
                      type="text"
                      value={contractTitle}
                      onChange={(e) => setContractTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>INITIAL DEPOSIT %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={depositPercent === 0 ? '' : depositPercent}
                      onChange={(e) => setDepositPercent(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#38bdf8', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

                {/* DEDICATED CLIENT SIGNER INPUT */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                    CLIENT REPRESENTATIVE / SIGNER NAME (Leave blank to keep write-in line)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Babatunde Sanwo / Mrs. Agnes Okon"
                    value={contractSignerName}
                    onChange={(e) => setContractSignerName(e.target.value)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>SCOPE OF WORK / SERVICE</label>
                    <textarea
                      rows={2}
                      value={contractScope}
                      onChange={(e) => setContractScope(e.target.value)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>KEY DELIVERABLES / HANDOFF</label>
                    <textarea
                      rows={2}
                      value={contractDeliverables}
                      onChange={(e) => setContractDeliverables(e.target.value)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                </div>

                {/* EQUIPMENT SAFETY CHECKBOX & FIELD */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      id="includeEquipmentSafetyCheckbox"
                      checked={includeEquipmentSafety}
                      onChange={(e) => setIncludeEquipmentSafety(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38bdf8' }}
                    />
                    <label htmlFor="includeEquipmentSafetyCheckbox" style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                      Include Equipment Safety & Venue Custody Clauses (Uncheck for regular event coverage)
                    </label>
                  </div>

                  {includeEquipmentSafety && (
                    <div>
                      <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>EQUIPMENT CUSTODY & VENUE OBLIGATIONS</label>
                      <textarea
                        rows={2}
                        value={contractCustomTerms}
                        onChange={(e) => setContractCustomTerms(e.target.value)}
                        style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={handleInvoiceSubmit} disabled={loading} style={{ flex: '2 1 200px', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'SAVING...' : editingInvoiceId ? 'UPDATE RECORD' : 'SAVE TO DATABASE'}
              </button>
              <button type="button" onClick={triggerPrintInvoice} style={{ flex: '1 1 140px', padding: '12px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                🖨️ PRINT INVOICE
              </button>
              <button type="button" onClick={triggerPrintContract} style={{ flex: '1 1 140px', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                📄 PRINT AGREEMENT
              </button>
            </div>
          </div>

          {/* PRINTABLE AREA */}
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            {printDocumentMode === 'invoice' && (
              <div id="printable-invoice-document" style={{ minWidth: '700px', backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '1px', margin: 0, color: '#000' }}>INVOICE</h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#333' }}>
                      <strong>Invoice No:</strong> {invNumber}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#333' }}>
                      <strong>Date:</strong> {invIssueDate}
                    </p>
                    {invDueDate && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#000' }}>
                        <strong>Due Date:</strong> {invDueDate}
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, letterSpacing: '2px', color: '#000' }}>TONYSHOTIT</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>anthony@tonyshotit.com</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>tonyshotit.com</p>
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
                    <p style={{ fontSize: '12px', color: '#333', margin: '2px 0 0 0' }}>anthony@tonyshotit.com</p>
                    <p style={{ fontSize: '12px', color: '#333', margin: '2px 0 0 0' }}>tonyshotit.com</p>
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
                        <td style={{ padding: '10px 4px', color: '#333', verticalAlign: 'top' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 4px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 'bold', color: '#000' }}>{item.description || 'Service Line Item'}</div>
                          {item.sub_description && (
                            <div style={{ fontSize: '10.5px', color: '#666', marginTop: '2px', lineHeight: '1.3' }}>
                              {item.sub_description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'center', color: '#333', verticalAlign: 'top' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: '#333', verticalAlign: 'top' }}>{currencySymbol}{(item.rate || 0).toLocaleString()}</td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 'bold', color: '#000', verticalAlign: 'top' }}>{currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                  <div style={{ width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                      <span style={{ fontWeight: 'bold' }}>Subtotal</span>
                      <span>{currencySymbol}{invoiceSubtotal.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #ddd', color: '#0284c7' }}>
                        <span style={{ fontWeight: 'bold' }}>Discount Applied</span>
                        <span>- {currencySymbol}{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', padding: '8px 0', borderBottom: '2px solid #000' }}>
                      <span>GRAND TOTAL</span>
                      <span>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</span>
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

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: '#000', textTransform: 'uppercase' }}>NOTES</p>
                    <p style={{ margin: 0, color: '#444', lineHeight: '1.4' }}>{invNotes}</p>
                  </div>

                  {includeTerms && (
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', color: '#000', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                        TERMS & CONDITIONS
                      </p>
                      <ol style={{ margin: 0, paddingLeft: '18px', color: '#444', fontSize: '11px', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Payment Milestones:</strong> An advance commitment deposit is required to confirm booking and mobilize crew/equipment. The remaining balance is strictly due within 24 hours of project completion / final deliverable handoff.
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Invoice Validity:</strong> This invoice and reserved equipment/dates remain valid until the specified Due Date. Once the due date has passed, this invoice becomes null and void, subject to schedule availability and price re-evaluation.
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Revisions & Scope:</strong> Agreed deliverables include complimentary review cycles. Additional days, overtime hours, or scope modifications outside the agreed line items will be billed separately.
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          <strong>Asset Ownership:</strong> All hardware, broadcast recordings, raw footage, and final video deliverables remain the property of Tonyshotit Studio until the final balance is settled in full.
                        </li>
                        <li>
                          <strong>Cancellation Policy:</strong> Cancellations made within 48 hours of call time forfeit the initial commitment deposit to cover equipment holding and crew retainers.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRINTABLE AREA: AGREEMENT WITH DYNAMIC SAFETY CLAUSE */}
            {printDocumentMode === 'contract' && (
              <div id="printable-contract-document" style={{ minWidth: '700px', backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '0.5px', margin: 0, color: '#0f172a' }}>
                      {contractTitle}
                    </h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Tonyshotit Studio • tonyshotit.com • anthony@tonyshotit.com
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                    <p style={{ margin: 0 }}>Ref: <strong>{invNumber}</strong></p>
                    <p style={{ margin: 0 }}>Date: <strong>{invIssueDate}</strong></p>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '2px solid #0f172a', marginBottom: '16px' }} />

                <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#334155', marginBottom: '16px' }}>
                  This Agreement is entered into as of <strong>{invIssueDate}</strong> by and between <strong>Tonyshotit Studio</strong>, represented by Anthony Ibuzo (the <em>"Producer / Supplier"</em>), and <strong>{invClientName || '[Client Organization Name]'}</strong> {invClientEmail && `(${invClientEmail})`} (the <em>"Client"</em>).
                </p>

                <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#1e293b' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', margin: '12px 0 4px 0', textTransform: 'uppercase' }}>
                    1. Project Scope & Deliverables
                  </h3>
                  <p style={{ margin: '0 0 4px 0' }}>• <strong>Project / Event:</strong> {invProjectFor || '[Project / Event Name]'}</p>
                  <p style={{ margin: '0 0 4px 0' }}>• <strong>Dates & Fulfillment Window:</strong> {invIssueDate} through {invDueDate || 'Event Conclusion'}</p>
                  <p style={{ margin: '0 0 4px 0' }}>• <strong>Scope of Service:</strong> {contractScope}</p>
                  <p style={{ margin: '0 0 12px 0' }}>• <strong>Deliverables:</strong> {contractDeliverables}</p>

                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', margin: '12px 0 4px 0', textTransform: 'uppercase' }}>
                    2. Payment Schedule & Milestones
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '10.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f172a', color: '#fff', textAlign: 'left' }}>
                        <th style={{ padding: '6px 8px' }}>Milestone</th>
                        <th style={{ padding: '6px 8px' }}>Amount Due</th>
                        <th style={{ padding: '6px 8px' }}>Trigger / Terms</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Commitment Deposit ({safeDepositPercent}%)</td>
                        <td style={{ padding: '6px 8px' }}>{currencySymbol}{depositAmount.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px' }}>Required upon signing to lock schedule, technical crew, and reserved hardware</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 'bold' }}>Final Balance ({100 - safeDepositPercent}%)</td>
                        <td style={{ padding: '6px 8px' }}>{currencySymbol}{balanceAmount.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px' }}>Strictly due within 24 hours of project / event completion</td>
                      </tr>
                      <tr style={{ borderBottom: '2px solid #0f172a', backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                        <td style={{ padding: '6px 8px' }}>Total Fee (After Discount)</td>
                        <td style={{ padding: '6px 8px' }}>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px' }}>Referenced in Invoice: {invNumber}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 14px 0' }}>
                    Settlement Details: <strong>{invBankName}</strong> | Account: <strong>{invAccountNumber}</strong> ({invAccountName}). Late settlements exceeding 5 business days incur a 5% weekly late fee.
                  </p>

                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', margin: '12px 0 4px 0', textTransform: 'uppercase' }}>
                    3. Key Operational Terms {includeEquipmentSafety ? '& Venue Dependencies' : ''}
                  </h3>
                  
                  {includeEquipmentSafety && (
                    <>
                      <p style={{ margin: '0 0 4px 0' }}>• <strong>Equipment Safety & Custody:</strong> {contractCustomTerms}</p>
                      <p style={{ margin: '0 0 4px 0' }}>• <strong>Damage & Loss:</strong> Any damage or loss to hardware resulting from event attendees, unstable electrical current, or lack of security will be billed to the Client at full replacement cost.</p>
                    </>
                  )}

                  <p style={{ margin: '0 0 4px 0' }}>• <strong>Asset Rights:</strong> All equipment, captured assets, or media outputs remain the property of Tonyshotit Studio until 100% final balance settlement is received.</p>
                  <p style={{ margin: '0 0 16px 0' }}>• <strong>Cancellation:</strong> Cancellations inside 48 hours of scheduled call time forfeit the commitment deposit to cover equipment holds and technical crew retainers.</p>

                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', margin: '14px 0 6px 0', textTransform: 'uppercase' }}>
                    4. Signatures & Acceptance
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
                    {/* PRODUCER SIGNATURE */}
                    <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '4px', backgroundColor: '#f8fafc', fontSize: '10.5px' }}>
                      <p style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>For Tonyshotit Studio:</p>
                      <p style={{ margin: '0 0 4px 0' }}>Signature: __________________________</p>
                      <p style={{ margin: '0 0 4px 0' }}>Name: <strong>Anthony Ibuzo</strong></p>
                      <p style={{ margin: '0 0 4px 0' }}>Title: Lead Technical Director / Producer</p>
                      <p style={{ margin: '0' }}>Date: ______________________________</p>
                    </div>

                    {/* CLIENT SIGNATURE */}
                    <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '4px', backgroundColor: '#f8fafc', fontSize: '10.5px' }}>
                      <p style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>For the Client:</p>
                      <p style={{ margin: '0 0 4px 0' }}>Signature: __________________________</p>
                      
                      {contractSignerName ? (
                        <p style={{ margin: '0 0 4px 0' }}>Name: <strong>{contractSignerName}</strong></p>
                      ) : (
                        <p style={{ margin: '0 0 4px 0' }}>Name: __________________________</p>
                      )}

                      {invClientName && (
                        <p style={{ margin: '0 0 4px 0', color: '#475569' }}>
                          Organization: <strong>{invClientName}</strong>
                        </p>
                      )}
                      
                      <p style={{ margin: '0 0 4px 0' }}>Title: Authorized Representative</p>
                      <p style={{ margin: '0' }}>Date: ______________________________</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SAVED INVOICES LIST (NO PRINT) */}
          <div className="no-print" style={{ marginTop: '36px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
              SAVED RECORDS ({invoices.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: '6px', border: '1px solid #222', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff' }}>{inv.invoice_number} - {inv.client_name}</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                      Date: {inv.issue_date} | Due: {inv.due_date || 'N/A'} | Status: {inv.status} | Total: {inv.currency || 'NGN'} {(inv.items?.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0) - (inv.discount || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditInvoice(inv)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button onClick={() => handleDeleteInvoice(inv.id!)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
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