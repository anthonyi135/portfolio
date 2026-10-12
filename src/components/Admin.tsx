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
  tax_percent?: number;
  show_vat_row?: boolean;
  extra_fee_label?: string;
  extra_fee_amount?: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  notes: string;
  created_at?: string;
}

interface PortfolioItem {
  id?: number;
  title: string;
  category: 'video' | 'live';
  video_src: string;
  poster?: string;
  role: string;
  equipment: string[];
  description: string;
  is_vertical: boolean;
  display_order?: number;
}

interface GearItemCMS {
  id?: number;
  name: string;
  category: string;
  tag: 'vision' | 'cinema' | 'wireless' | 'audio' | 'aerial';
  description: string;
}

interface ExperienceItemCMS {
  id?: number;
  year: string;
  title: string;
  company: string;
  responsibilities: string[];
}

const MASTER_ADMIN_PIN = '1472';

export const Admin: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'invoices' | 'galleries' | 'cms'>('invoices');
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
  const [invTaxPercent, setInvTaxPercent] = useState<number>(0);
  const [showVatRow, setShowVatRow] = useState<boolean>(true);
  const [invExtraFeeLabel, setInvExtraFeeLabel] = useState<string>('');
  const [invExtraFeeAmount, setInvExtraFeeAmount] = useState<number>(0);
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { description: 'Service Line Item', sub_description: '', quantity: 1, rate: 0 }
  ]);
  const [invNotes, setInvNotes] = useState('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');

  // Contract Customization States
  const [printDocumentMode, setPrintDocumentMode] = useState<'invoice' | 'contract'>('invoice');

  // CMS Sub-Tabs
  const [cmsSubTab, setCmsSubTab] = useState<'portfolio' | 'gear' | 'timeline'>('portfolio');

  // CMS: Portfolio State
  const [cmsPortfolioList, setCmsPortfolioList] = useState<PortfolioItem[]>([]);
  const [editingPortId, setEditingPortId] = useState<number | null>(null);
  const [portTitle, setPortTitle] = useState('');
  const [portCategory, setPortCategory] = useState<'video' | 'live'>('video');
  const [portVideoSrc, setPortVideoSrc] = useState('');
  const [portRole, setPortRole] = useState('');
  const [portEquipment, setPortEquipment] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portIsVertical, setPortIsVertical] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // CMS: Gear State
  const [cmsGearList, setCmsGearList] = useState<GearItemCMS[]>([]);
  const [editingGearId, setEditingGearId] = useState<number | null>(null);
  const [gearName, setGearName] = useState('');
  const [gearCategory, setGearCategory] = useState('');
  const [gearTag, setGearTag] = useState<'vision' | 'cinema' | 'wireless' | 'audio' | 'aerial'>('vision');
  const [gearDesc, setGearDesc] = useState('');

  // CMS: Timeline State
  const [cmsTimelineList, setCmsTimelineList] = useState<ExperienceItemCMS[]>([]);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [expYear, setExpYear] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expResponsibilities, setExpResponsibilities] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchProjects();
      fetchInvoices();
      fetchCmsPortfolio();
      fetchCmsGear();
      fetchCmsTimeline();
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

  // --- API FETCHERS ---
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('client_projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProjects(data);
    } catch (err: any) {
      console.error('Error fetching galleries:', err.message);
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

  const fetchCmsPortfolio = async () => {
    try {
      const { data, error } = await supabase.from('portfolio_projects').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setCmsPortfolioList(data);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err.message);
    }
  };

  const fetchCmsGear = async () => {
    try {
      const { data, error } = await supabase.from('gear_items').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setCmsGearList(data);
    } catch (err: any) {
      console.error('Error fetching gear:', err.message);
    }
  };

  const fetchCmsTimeline = async () => {
    try {
      const { data, error } = await supabase.from('experience_timeline').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setCmsTimelineList(data);
    } catch (err: any) {
      console.error('Error fetching timeline:', err.message);
    }
  };

  // --- GALLERY HANDLERS ---
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
    if (!id) return;
    if (!window.confirm('Delete this client gallery?')) return;
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      const { error } = await supabase.from('client_projects').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Client gallery deleted successfully!' });
      fetchProjects();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
      fetchProjects();
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
        setStatusMsg({ type: 'success', text: 'Client gallery updated!' });
      } else {
        const { error } = await supabase.from('client_projects').insert([payload]);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Client gallery published!' });
      }
      resetGalleryForm();
      fetchProjects();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- SUPABASE STORAGE REEL UPLOAD ---
  const handleDirectReelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const cleanFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-videos')
        .upload(cleanFileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('portfolio-videos')
        .getPublicUrl(cleanFileName);

      setPortVideoSrc(publicData.publicUrl);
      setStatusMsg({ type: 'success', text: `Reel uploaded successfully: ${cleanFileName}` });
    } catch (err: any) {
      console.error('Storage Upload Error:', err);
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  // --- PORTFOLIO CMS HANDLERS ---
  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: portTitle,
      category: portCategory,
      video_src: portVideoSrc,
      role: portRole,
      equipment: portEquipment.split(',').map((s) => s.trim()).filter(Boolean),
      description: portDesc,
      is_vertical: portIsVertical,
    };

    try {
      if (editingPortId) {
        const { error } = await supabase.from('portfolio_projects').update(payload).eq('id', editingPortId);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Portfolio project updated!' });
      } else {
        const { error } = await supabase.from('portfolio_projects').insert([payload]);
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Portfolio project added!' });
      }
      resetPortfolioForm();
      fetchCmsPortfolio();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetPortfolioForm = () => {
    setEditingPortId(null);
    setPortTitle('');
    setPortCategory('video');
    setPortVideoSrc('');
    setPortRole('');
    setPortEquipment('');
    setPortDesc('');
    setPortIsVertical(false);
  };

  const handleEditPortfolio = (item: PortfolioItem) => {
    setEditingPortId(item.id || null);
    setPortTitle(item.title);
    setPortCategory(item.category);
    setPortVideoSrc(item.video_src);
    setPortRole(item.role);
    setPortEquipment(Array.isArray(item.equipment) ? item.equipment.join(', ') : '');
    setPortDesc(item.description);
    setPortIsVertical(item.is_vertical);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeletePortfolio = async (id?: number) => {
    if (!id && id !== 0) {
      alert('Error: Project ID is missing.');
      return;
    }

    if (!window.confirm('Delete this portfolio project?')) return;

    try {
      setCmsPortfolioList((prev) => prev.filter((p) => p.id !== id));
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Portfolio project deleted successfully.' });
      fetchCmsPortfolio();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Delete failed: ${err.message}`);
      setStatusMsg({ type: 'error', text: `Delete failed: ${err.message}` });
      fetchCmsPortfolio();
    }
  };

  // --- GEAR CMS HANDLERS ---
  const handleGearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: gearName,
      category: gearCategory,
      tag: gearTag,
      description: gearDesc,
    };

    try {
      if (editingGearId) {
        const { error } = await supabase.from('gear_items').update(payload).eq('id', editingGearId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gear_items').insert([payload]);
        if (error) throw error;
      }
      resetGearForm();
      fetchCmsGear();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetGearForm = () => {
    setEditingGearId(null);
    setGearName('');
    setGearCategory('');
    setGearTag('vision');
    setGearDesc('');
  };

  const handleEditGear = (g: GearItemCMS) => {
    setEditingGearId(g.id || null);
    setGearName(g.name);
    setGearCategory(g.category);
    setGearTag(g.tag);
    setGearDesc(g.description);
  };

  const handleDeleteGear = async (id?: number) => {
    if (!id && id !== 0) return;
    if (!window.confirm('Delete gear item?')) return;
    try {
      setCmsGearList((prev) => prev.filter((g) => g.id !== id));
      const { error } = await supabase.from('gear_items').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Gear item deleted!' });
      fetchCmsGear();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
      fetchCmsGear();
    }
  };

  // --- TIMELINE CMS HANDLERS ---
  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      year: expYear,
      title: expTitle,
      company: expCompany,
      responsibilities: expResponsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingExpId) {
        const { error } = await supabase.from('experience_timeline').update(payload).eq('id', editingExpId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('experience_timeline').insert([payload]);
        if (error) throw error;
      }
      resetTimelineForm();
      fetchCmsTimeline();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetTimelineForm = () => {
    setEditingExpId(null);
    setExpYear('');
    setExpTitle('');
    setExpCompany('');
    setExpResponsibilities('');
  };

  const handleEditTimeline = (exp: ExperienceItemCMS) => {
    setEditingExpId(exp.id || null);
    setExpYear(exp.year);
    setExpTitle(exp.title);
    setExpCompany(exp.company);
    setExpResponsibilities(Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : '');
  };

  const handleDeleteTimeline = async (id?: number) => {
    if (!id && id !== 0) return;
    if (!window.confirm('Delete experience milestone?')) return;
    try {
      setCmsTimelineList((prev) => prev.filter((t) => t.id !== id));
      const { error } = await supabase.from('experience_timeline').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Experience milestone deleted!' });
      fetchCmsTimeline();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
      fetchCmsTimeline();
    }
  };

  // --- INVOICE HANDLERS ---
  const resetInvoiceForm = () => {
    setEditingInvoiceId(null);
    setInvNumber(`TS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`);
    setInvClientName('');
    setInvClientEmail('');
    setInvProjectFor('');
    setInvIssueDate(new Date().toISOString().split('T')[0]);
    setInvDueDate('');
    setInvCurrency('NGN');
    setInvStatus('Sent');
    setInvBankName('GT Bank');
    setInvAccountNumber('0430859996');
    setInvAccountName('Anthony Ibuzo');
    setInvDiscount(0);
    setInvTaxPercent(0);
    setShowVatRow(true);
    setInvExtraFeeLabel('');
    setInvExtraFeeAmount(0);
    setInvItems([{ description: 'Service Line Item', sub_description: '', quantity: 1, rate: 0 }]);
    setInvNotes('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');
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
    setInvTaxPercent(inv.tax_percent || 0);
    setShowVatRow(inv.show_vat_row !== undefined ? inv.show_vat_row : true);
    setInvExtraFeeLabel(inv.extra_fee_label || '');
    setInvExtraFeeAmount(inv.extra_fee_amount || 0);
    setInvItems(
      inv.items && inv.items.length > 0
        ? inv.items.map(item => ({ ...item, sub_description: item.sub_description || '' }))
        : [{ description: '', sub_description: '', quantity: 1, rate: 0 }]
    );
    setInvNotes(inv.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInvoice = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this invoice?')) return;
    try {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Invoice record deleted!' });
      if (editingInvoiceId === id) resetInvoiceForm();
      fetchInvoices();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
      fetchInvoices();
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
      tax_percent: invTaxPercent || 0,
      show_vat_row: showVatRow,
      extra_fee_label: invExtraFeeLabel || '',
      extra_fee_amount: invExtraFeeAmount || 0,
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

  // Financial calculations
  const servicesSubtotal = invItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
  const discountAmount = Math.max(0, invDiscount || 0);
  const taxableBase = Math.max(0, servicesSubtotal - discountAmount);
  const safeTaxPercent = Math.max(0, invTaxPercent || 0);
  const taxAmount = Math.round(taxableBase * (safeTaxPercent / 100));
  const extraFeeAmount = Math.max(0, invExtraFeeAmount || 0);
  const invoiceGrandTotal = taxableBase + (showVatRow ? taxAmount : 0) + extraFeeAmount;
  const currencySymbol = invCurrency === 'NGN' ? 'NGN ' : invCurrency === 'GBP' ? '£ ' : invCurrency === 'EUR' ? '€ ' : '$ ';

  // Reusable input styling for mobile responsive stability
  const inputStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    backgroundColor: '#000',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px 20px', maxWidth: '380px', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔑</div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>ADMIN STUDIO LOCK</h2>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px' }}>Enter studio passcode to manage records</p>
          <form onSubmit={handleAdminUnlock}>
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="• • • •"
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', marginBottom: '16px' }}
            />
            {pinError && <p style={{ color: '#f87171', fontSize: '12px', marginBottom: '16px' }}>{pinError}</p>}
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              ACCESS STUDIO
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1050px', margin: '0 auto', padding: '16px 12px 60px', color: '#fff', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '0.5px' }}>TONYSHOTIT STUDIOS</h1>
          <p style={{ color: '#71717a', margin: 0, fontSize: '11px', fontWeight: 600 }}>MANAGEMENT DASHBOARD • BN: 9926513</p>
        </div>
        <button onClick={() => setIsAdminAuthenticated(false)} style={{ padding: '8px 14px', backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          🔒 Lock Studio
        </button>
      </div>

      {/* TOP TABS - Horizontal scrollable & tap-friendly on mobile */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', WebkitOverflowScrolling: 'touch' }}>
        <button 
          onClick={() => setActiveTab('invoices')} 
          style={{ 
            flexShrink: 0, 
            padding: '10px 16px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            backgroundColor: activeTab === 'invoices' ? '#fff' : '#18181b', 
            color: activeTab === 'invoices' ? '#000' : '#a1a1aa', 
            border: '1px solid #27272a' 
          }}
        >
          🧾 Invoices & Agreements ({invoices.length})
        </button>
        <button 
          onClick={() => setActiveTab('cms')} 
          style={{ 
            flexShrink: 0, 
            padding: '10px 16px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            backgroundColor: activeTab === 'cms' ? '#38bdf8' : '#18181b', 
            color: activeTab === 'cms' ? '#000' : '#a1a1aa', 
            border: '1px solid #27272a' 
          }}
        >
          🌐 Website CMS
        </button>
        <button 
          onClick={() => setActiveTab('galleries')} 
          style={{ 
            flexShrink: 0, 
            padding: '10px 16px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            backgroundColor: activeTab === 'galleries' ? '#fff' : '#18181b', 
            color: activeTab === 'galleries' ? '#000' : '#a1a1aa', 
            border: '1px solid #27272a' 
          }}
        >
          🎬 Client Deliveries ({projects.length})
        </button>
      </div>

      {statusMsg && (
        <div className="no-print" style={{ padding: '12px 14px', borderRadius: '6px', marginBottom: '16px', backgroundColor: statusMsg.type === 'success' ? '#14532d' : '#7f1d1d', color: '#fff', fontSize: '13px' }}>
          {statusMsg.text}
        </div>
      )}

      {/* ===================== TAB 1: INVOICES & AGREEMENTS ===================== */}
      {activeTab === 'invoices' && (
        <div>
          <div className="no-print" style={{ backgroundColor: '#09090b', padding: '16px 12px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '24px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#38bdf8' }}>INVOICE & CONTRACT BUILDER</h2>
              <div style={{ display: 'flex', gap: '6px', width: '100%', maxWidth: '340px' }}>
                <button type="button" onClick={() => setPrintDocumentMode('invoice')} style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: printDocumentMode === 'invoice' ? '#fff' : '#18181b', color: printDocumentMode === 'invoice' ? '#000' : '#a1a1aa', border: '1px solid #27272a' }}>
                  Preview Invoice
                </button>
                <button type="button" onClick={() => setPrintDocumentMode('contract')} style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: printDocumentMode === 'contract' ? '#38bdf8' : '#18181b', color: printDocumentMode === 'contract' ? '#000' : '#a1a1aa', border: '1px solid #27272a' }}>
                  Agreement Mode
                </button>
              </div>
            </div>

            {/* ROW 1: INVOICE IDENTIFIERS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>INVOICE NUMBER</label>
                <input type="text" value={invNumber} onChange={(e) => setInvNumber(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={labelStyle}>ISSUE DATE</label>
                  <input type="date" value={invIssueDate} onChange={(e) => setInvIssueDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>DUE DATE</label>
                  <input type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* ROW 2: CLIENT DETAILS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>CLIENT / COMPANY</label>
                <input type="text" value={invClientName} onChange={(e) => setInvClientName(e.target.value)} placeholder="e.g. Pan-Atlantic University" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CLIENT EMAIL</label>
                <input type="email" value={invClientEmail} onChange={(e) => setInvClientEmail(e.target.value)} placeholder="client@organization.com" style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>FOR (PROJECT / EVENT)</label>
                <input type="text" value={invProjectFor} onChange={(e) => setInvProjectFor(e.target.value)} placeholder="e.g. 2026 Convocation Live Broadcast" style={inputStyle} />
              </div>
            </div>

            {/* ROW 3: SETTINGS & BANKING */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>CURRENCY</label>
                <select value={invCurrency} onChange={(e) => setInvCurrency(e.target.value)} style={inputStyle}>
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>STATUS</label>
                <select value={invStatus} onChange={(e) => setInvStatus(e.target.value as any)} style={inputStyle}>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>BANK NAME</label>
                <input type="text" value={invBankName} onChange={(e) => setInvBankName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ACCOUNT NO.</label>
                <input type="text" value={invAccountNumber} onChange={(e) => setInvAccountNumber(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* LINE ITEMS SECTION - FULLY RESPONSIVE */}
            <div style={{ marginBottom: '16px', borderTop: '1px solid #27272a', paddingTop: '14px' }}>
              <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>
                TAXABLE SERVICE LINE ITEMS
              </label>

              {invItems.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#141416', padding: '12px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '10px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
                  
                  {/* Top Line: Item Name & Delete Button */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Service title (e.g. Sound Equipment)" 
                      value={item.description} 
                      onChange={(e) => { 
                        const u = [...invItems]; 
                        u[idx].description = e.target.value; 
                        setInvItems(u); 
                      }} 
                      style={{ ...inputStyle, flex: 1, minWidth: 0, fontWeight: 600 }} 
                    />
                    {invItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))} 
                        style={{ padding: '8px 12px', backgroundColor: '#3f1212', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Bottom Line: Qty & Rate (Clean mobile flex that does not overflow) */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: '80px', flexShrink: 0 }}>
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        value={item.quantity === 0 ? '' : item.quantity} 
                        onChange={(e) => { 
                          const u = [...invItems]; 
                          u[idx].quantity = parseFloat(e.target.value) || 0; 
                          setInvItems(u); 
                        }} 
                        style={{ ...inputStyle, textAlign: 'center' }} 
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input 
                        type="number" 
                        placeholder="Rate / Price" 
                        value={item.rate === 0 ? '' : item.rate} 
                        onChange={(e) => { 
                          const u = [...invItems]; 
                          u[idx].rate = parseFloat(e.target.value) || 0; 
                          setInvItems(u); 
                        }} 
                        style={{ ...inputStyle, color: '#38bdf8', fontWeight: 'bold' }} 
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={() => setInvItems([...invItems, { description: '', sub_description: '', quantity: 1, rate: 0 }])} 
                style={{ width: '100%', padding: '12px', fontSize: '12px', backgroundColor: '#18181b', color: '#38bdf8', border: '1px dashed #38bdf8', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                + Add Another Line Item
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={handleInvoiceSubmit} 
                disabled={loading} 
                style={{ padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
              >
                {loading ? 'SAVING...' : editingInvoiceId ? 'UPDATE RECORD' : 'SAVE RECORD'}
              </button>
              <button 
                type="button" 
                onClick={() => { setPrintDocumentMode('invoice'); setTimeout(() => window.print(), 100); }} 
                style={{ padding: '12px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                🖨️ PRINT INVOICE
              </button>
              <button 
                type="button" 
                onClick={() => { setPrintDocumentMode('contract'); setTimeout(() => window.print(), 100); }} 
                style={{ padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                📄 PRINT AGREEMENT
              </button>
            </div>
          </div>

          {/* SAVED INVOICES LIST */}
          <div className="no-print" style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '12px', color: '#a1a1aa' }}>SAVED INVOICES ({invoices.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090b', padding: '12px', borderRadius: '8px', border: '1px solid #27272a', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{inv.invoice_number} • {inv.client_name}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#71717a' }}>Total: {inv.currency || 'NGN'} {(inv.items?.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0) || 0).toLocaleString()} • Status: {inv.status}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => handleEditInvoice(inv)} style={{ padding: '6px 12px', backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button type="button" onClick={() => handleDeleteInvoice(inv.id)} style={{ padding: '6px 12px', backgroundColor: '#3f1212', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: WEBSITE CMS ===================== */}
      {activeTab === 'cms' && (
        <div className="no-print">
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
            <button onClick={() => setCmsSubTab('portfolio')} style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'portfolio' ? '#fff' : '#18181b', color: cmsSubTab === 'portfolio' ? '#000' : '#888', border: '1px solid #27272a' }}>
              🎥 Portfolio ({cmsPortfolioList.length})
            </button>
            <button onClick={() => setCmsSubTab('gear')} style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'gear' ? '#fff' : '#18181b', color: cmsSubTab === 'gear' ? '#000' : '#888', border: '1px solid #27272a' }}>
              ⚙️ Gear Arsenal ({cmsGearList.length})
            </button>
            <button onClick={() => setCmsSubTab('timeline')} style={{ flexShrink: 0, padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'timeline' ? '#fff' : '#18181b', color: cmsSubTab === 'timeline' ? '#000' : '#888', border: '1px solid #27272a' }}>
              ⏱️ Experience ({cmsTimelineList.length})
            </button>
          </div>

          {/* SUB-SECTION: PORTFOLIO */}
          {cmsSubTab === 'portfolio' && (
            <div>
              <form onSubmit={handlePortfolioSubmit} style={{ backgroundColor: '#09090b', padding: '14px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '14px', color: '#38bdf8' }}>
                  {editingPortId ? 'EDIT PORTFOLIO PROJECT' : 'ADD NEW PORTFOLIO PROJECT'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>PROJECT TITLE</label>
                    <input type="text" required value={portTitle} onChange={(e) => setPortTitle(e.target.value)} placeholder="e.g. WHAT A FINALIST FEELS LIKE" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CATEGORY</label>
                    <select value={portCategory} onChange={(e) => setPortCategory(e.target.value as any)} style={inputStyle}>
                      <option value="video">Digital Cinema / Commercial Video</option>
                      <option value="live">Live Multi-Camera Broadcast</option>
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: '#141416', padding: '12px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, color: '#38bdf8' }}>
                    VIDEO URL (.mp4 or YouTube Embed)
                  </label>
                  <input
                    type="text"
                    required
                    value={portVideoSrc}
                    onChange={(e) => setPortVideoSrc(e.target.value)}
                    placeholder="https://... or YouTube Embed URL"
                    style={{ ...inputStyle, marginBottom: '8px' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa', cursor: 'pointer', backgroundColor: '#27272a', padding: '6px 12px', borderRadius: '4px', border: '1px solid #3f3f46', flexShrink: 0 }}>
                      📁 Upload Reel to Storage
                      <input type="file" accept="video/mp4,video/quicktime" onChange={handleDirectReelUpload} style={{ display: 'none' }} />
                    </label>
                    {uploadingVideo && <span style={{ fontSize: '11px', color: '#38bdf8', fontStyle: 'italic' }}>Uploading...</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>PRODUCTION ROLE</label>
                    <input type="text" required value={portRole} onChange={(e) => setPortRole(e.target.value)} placeholder="Director of Photography • Lead Editor" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>EQUIPMENT (Comma-separated)</label>
                    <input type="text" value={portEquipment} onChange={(e) => setPortEquipment(e.target.value)} placeholder="Sony A7III, DaVinci Resolve" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea rows={2} required value={portDesc} onChange={(e) => setPortDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <input type="checkbox" id="verticalCheck" checked={portIsVertical} onChange={(e) => setPortIsVertical(e.target.checked)} style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }} />
                  <label htmlFor="verticalCheck" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>
                    Vertical Video (9:16 Aspect Ratio)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                    {loading ? 'SAVING...' : editingPortId ? 'UPDATE PROJECT' : 'ADD TO PORTFOLIO'}
                  </button>
                  {editingPortId && (
                    <button type="button" onClick={resetPortfolioForm} style={{ padding: '10px 14px', backgroundColor: '#27272a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cmsPortfolioList.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090b', padding: '12px', borderRadius: '6px', border: '1px solid #27272a' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#71717a' }}>{item.category} • {item.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button type="button" onClick={() => handleEditPortfolio(item)} style={{ padding: '6px 10px', backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button type="button" onClick={() => handleDeletePortfolio(Number(item.id))} style={{ padding: '6px 10px', backgroundColor: '#3f1212', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION: GEAR */}
          {cmsSubTab === 'gear' && (
            <div>
              <form onSubmit={handleGearSubmit} style={{ backgroundColor: '#09090b', padding: '14px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '14px', color: '#38bdf8' }}>
                  {editingGearId ? 'EDIT GEAR ITEM' : 'ADD NEW GEAR ITEM'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>NAME</label>
                    <input type="text" required value={gearName} onChange={(e) => setGearName(e.target.value)} placeholder="e.g. Blackmagic ATEM 2 M/E" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CATEGORY</label>
                    <input type="text" required value={gearCategory} onChange={(e) => setGearCategory(e.target.value)} placeholder="e.g. Production Switchers" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>TAG</label>
                    <select value={gearTag} onChange={(e) => setGearTag(e.target.value as any)} style={inputStyle}>
                      <option value="vision">Vision & Switching</option>
                      <option value="cinema">Cinema Cameras & Rigging</option>
                      <option value="wireless">Wireless Transmission</option>
                      <option value="audio">Audio Chain</option>
                      <option value="aerial">Aerial Drones</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea rows={2} required value={gearDesc} onChange={(e) => setGearDesc(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                    {loading ? 'SAVING...' : editingGearId ? 'UPDATE GEAR' : 'ADD TO ARSENAL'}
                  </button>
                  {editingGearId && (
                    <button type="button" onClick={resetGearForm} style={{ padding: '10px 14px', backgroundColor: '#27272a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cmsGearList.map((g) => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090b', padding: '12px', borderRadius: '6px', border: '1px solid #27272a' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#71717a' }}>{g.tag} • {g.category}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button type="button" onClick={() => handleEditGear(g)} style={{ padding: '6px 10px', backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button type="button" onClick={() => handleDeleteGear(Number(g.id))} style={{ padding: '6px 10px', backgroundColor: '#3f1212', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION: TIMELINE */}
          {cmsSubTab === 'timeline' && (
            <div>
              <form onSubmit={handleTimelineSubmit} style={{ backgroundColor: '#09090b', padding: '14px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '14px', color: '#38bdf8' }}>
                  {editingExpId ? 'EDIT EXPERIENCE MILESTONE' : 'ADD NEW MILESTONE'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>TIMEFRAME</label>
                    <input type="text" required value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="e.g. 2023 - Present" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>ROLE</label>
                    <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="Lead Technical Director" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>ORGANIZATION</label>
                    <input type="text" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="Pan-Atlantic University" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>RESPONSIBILITIES (One per line)</label>
                  <textarea rows={3} required value={expResponsibilities} onChange={(e) => setExpResponsibilities(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                    {loading ? 'SAVING...' : editingExpId ? 'UPDATE MILESTONE' : 'ADD MILESTONE'}
                  </button>
                  {editingExpId && (
                    <button type="button" onClick={resetTimelineForm} style={{ padding: '10px 14px', backgroundColor: '#27272a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cmsTimelineList.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090b', padding: '12px', borderRadius: '6px', border: '1px solid #27272a' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title} ({t.year})</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#71717a' }}>{t.company}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button type="button" onClick={() => handleEditTimeline(t)} style={{ padding: '6px 10px', backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button type="button" onClick={() => handleDeleteTimeline(Number(t.id))} style={{ padding: '6px 10px', backgroundColor: '#3f1212', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: CLIENT GALLERIES ===================== */}
      {activeTab === 'galleries' && (
        <div className="no-print">
          <form onSubmit={handleGallerySubmit} style={{ backgroundColor: '#09090b', padding: '14px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '14px', color: '#38bdf8' }}>
              {editingProjectId ? 'EDIT CLIENT GALLERY LINK' : 'CREATE CLIENT DELIVERY GALLERY'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>CLIENT / ORGANIZATION</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Pan-Atlantic University" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PROJECT TITLE</label>
                <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Convocation 2026 Master Delivery" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>URL SLUG (/client/[slug])</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="pau-convocation" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CLIENT ACCESS PIN</label>
                <input type="text" required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="2026" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '16px', borderTop: '1px solid #27272a', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 'bold' }}>VIDEO STREAMS ({videos.length})</label>
                <button type="button" onClick={() => setVideos([...videos, { title: `Stream ${videos.length + 1}`, url: '' }])} style={{ padding: '6px 10px', fontSize: '11px', backgroundColor: '#18181b', color: '#38bdf8', border: '1px solid #27272a', borderRadius: '4px', cursor: 'pointer' }}>
                  + Add Stream
                </button>
              </div>

              {videos.map((vid, idx) => (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Title" value={vid.title} onChange={(e) => { const updated = [...videos]; updated[idx].title = e.target.value; setVideos(updated); }} style={{ ...inputStyle, flex: '1 1 120px' }} />
                  <input type="text" placeholder="Video URL" value={vid.url} onChange={(e) => { const updated = [...videos]; updated[idx].url = e.target.value; setVideos(updated); }} style={{ ...inputStyle, flex: '2 1 180px' }} />
                  {videos.length > 1 && (
                    <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== idx))} style={{ padding: '8px 10px', backgroundColor: '#3f1212', color: '#f87171', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>DOWNLOAD LINK (Google Drive / Dropbox ZIP)</label>
              <input type="text" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://drive.google.com/..." style={inputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>DIRECTOR NOTES & HANDOFF INSTRUCTIONS</label>
              <textarea rows={2} value={directorNotes} onChange={(e) => setDirectorNotes(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                {loading ? 'SAVING...' : editingProjectId ? 'UPDATE GALLERY LINK' : 'PUBLISH CLIENT GALLERY'}
              </button>
              {editingProjectId && (
                <button type="button" onClick={resetGalleryForm} style={{ padding: '10px 14px', backgroundColor: '#27272a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  CANCEL
                </button>
              )}
            </div>
          </form>

          {/* ACTIVE GALLERIES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090b', padding: '12px', borderRadius: '8px', border: '1px solid #27272a', gap: '8px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.client_name} - {proj.project_title}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#71717a' }}>Slug: <code style={{ color: '#38bdf8' }}>/client/{proj.slug}</code> • PIN: {proj.pin}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <a href={`/client/${proj.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 8px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>
                    View ↗
                  </a>
                  <button type="button" onClick={() => handleEditProject(proj)} style={{ padding: '6px 8px', backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteProject(proj.id!)} style={{ padding: '6px 8px', backgroundColor: '#3f1212', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE AREA (Hidden on screen, isolated for clean PDF printing) */}
      <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', display: 'none' }}>
        {printDocumentMode === 'invoice' && (
          <div id="printable-invoice-document" style={{ minWidth: '700px', backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#000' }}>INVOICE</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#333' }}><strong>Invoice No:</strong> {invNumber}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#333' }}><strong>Date:</strong> {invIssueDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#000' }}>TONYSHOTIT STUDIOS</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>anthony@tonyshotit.com</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>tonyshotit.com</p>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #000', marginBottom: '24px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
              <div style={{ width: '360px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                  <span style={{ fontWeight: 'bold' }}>Subtotal</span>
                  <span>{currencySymbol}{servicesSubtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', padding: '8px 0', borderBottom: '2px solid #000' }}>
                  <span>GRAND TOTAL</span>
                  <span>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 