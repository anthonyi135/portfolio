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
  const [includeTerms, setIncludeTerms] = useState(true);

  // Contract Customization States
  const [contractTypePreset, setContractTypePreset] = useState<'broadcast' | 'video_edit'>('broadcast');
  const [contractTitle, setContractTitle] = useState('LIVE BROADCAST & EVENT PRODUCTION SERVICES AGREEMENT');
  const [contractFulfillmentWindow, setContractFulfillmentWindow] = useState('');
  const [contractScope, setContractScope] = useState('Live multi-camera broadcast engineering, video switching, audio routing, and equipment provision as itemized in the attached invoice.');
  const [contractDeliverables, setContractDeliverables] = useState('1. Live transmission to designated client destinations\n2. Master program archival recording delivered via Tonyshotit Client Portal\n3. Full-resolution backup media download access');
  const [depositPercent, setDepositPercent] = useState<number>(70);
  const [finalPaymentTrigger, setFinalPaymentTrigger] = useState('Final 30% balance is strictly due on on-site setup / call day prior to equipment activation or live transmission.');
  const [includeEquipmentSafety, setIncludeEquipmentSafety] = useState(true);
  const [contractCustomTerms, setContractCustomTerms] = useState('Client guarantees secure overnight hold, stable uninterrupted generator power, and full liability for any physical damage caused by event attendees.');
  const [contractSignerName, setContractSignerName] = useState('');
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

  const handlePresetChange = (preset: 'broadcast' | 'video_edit') => {
    setContractTypePreset(preset);
    if (preset === 'broadcast') {
      setContractTitle('LIVE BROADCAST & EVENT PRODUCTION SERVICES AGREEMENT');
      setContractScope('Live multi-camera broadcast engineering, video switching, audio routing, and equipment provision as itemized in the attached invoice.');
      setContractDeliverables('1. Live stream broadcast to client streaming endpoints\n2. Master archival program record\n3. Portal download link access');
      setFinalPaymentTrigger('Final 30% balance is strictly due on on-site setup / call day prior to equipment activation or live transmission.');
      setIncludeEquipmentSafety(true);
      setContractCustomTerms('Client guarantees secure overnight hold, stable uninterrupted generator power, and full liability for any physical damage caused by event attendees.');
    } else {
      setContractTitle('CINEMATOGRAPHY & VIDEO PRODUCTION AGREEMENT');
      setContractScope('On-site cinematography, sound capture, lighting execution, and multi-stage post-production editing.');
      setContractDeliverables('1. Master highlight reel (4K/1080p)\n2. Social media cutdowns / vertical deliverables\n3. Up to two (2) complimentary rounds of minor revisions');
      setFinalPaymentTrigger('Final 30% balance is due upon presentation of draft preview exports. Final, unwatermarked high-resolution masters and full asset release occur strictly upon confirmation of 100% balance settlement.');
      setIncludeEquipmentSafety(false);
    }
  };

  // --- API FETCHERS ---
  const fetchProjects = async () => {
    const { data } = await supabase.from('client_projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  const fetchInvoices = async () => {
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (data) setInvoices(data);
  };

  const fetchCmsPortfolio = async () => {
    const { data } = await supabase.from('portfolio_projects').select('*').order('id', { ascending: true });
    if (data) setCmsPortfolioList(data);
  };

  const fetchCmsGear = async () => {
    const { data } = await supabase.from('gear_items').select('*').order('id', { ascending: true });
    if (data) setCmsGearList(data);
  };

  const fetchCmsTimeline = async () => {
    const { data } = await supabase.from('experience_timeline').select('*').order('id', { ascending: true });
    if (data) setCmsTimelineList(data);
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
      setStatusMsg({ type: 'success', text: `Reel uploaded successfully to Supabase: ${cleanFileName}` });
    } catch (err: any) {
      console.error('Storage Upload Error:', err);
      alert(`Upload Failed: ${err.message}. Make sure your 'portfolio-videos' bucket allows public inserts.`);
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

  const handleDeletePortfolio = async (id: number) => {
    if (!window.confirm('Delete this portfolio project?')) return;
    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      fetchCmsPortfolio();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
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

  const handleDeleteGear = async (id: number) => {
    if (!window.confirm('Delete gear item?')) return;
    await supabase.from('gear_items').delete().eq('id', id);
    fetchCmsGear();
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

  const handleDeleteTimeline = async (id: number) => {
    if (!window.confirm('Delete experience milestone?')) return;
    await supabase.from('experience_timeline').delete().eq('id', id);
    fetchCmsTimeline();
  };

  // Financial calculations
  const servicesSubtotal = invItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
  const discountAmount = Math.max(0, invDiscount || 0);
  const taxableBase = Math.max(0, servicesSubtotal - discountAmount);
  const safeTaxPercent = Math.max(0, invTaxPercent || 0);
  const taxAmount = Math.round(taxableBase * (safeTaxPercent / 100));
  const extraFeeAmount = Math.max(0, invExtraFeeAmount || 0);
  const invoiceGrandTotal = taxableBase + (showVatRow ? taxAmount : 0) + extraFeeAmount;
  const safeDepositPercent = Math.min(100, Math.max(0, depositPercent || 70));
  const depositAmount = Math.round(invoiceGrandTotal * (safeDepositPercent / 100));
  const balanceAmount = invoiceGrandTotal - depositAmount;
  const currencySymbol = invCurrency === 'NGN' ? 'NGN ' : invCurrency === 'GBP' ? '£ ' : invCurrency === 'EUR' ? '€ ' : '$ ';
  const overtimeRateFormatted = invCurrency === 'NGN' ? 'NGN 25,000' : invCurrency === 'USD' ? '$50' : invCurrency === 'GBP' ? '£40' : '€45';

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
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '24px 14px', color: '#fff' }}>
      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>TONYSHOTIT STUDIOS</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '11px' }}>MANAGEMENT DASHBOARD • BN: 9926513</p>
        </div>
        <button onClick={() => setIsAdminAuthenticated(false)} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          🔒 Lock Studio
        </button>
      </div>

      {/* TOP TABS */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('invoices')} style={{ flex: '1 1 auto', minWidth: '150px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'invoices' ? '#fff' : '#111', color: activeTab === 'invoices' ? '#000' : '#888', border: '1px solid #333' }}>
          🧾 Invoices & Agreements
        </button>
        <button onClick={() => setActiveTab('cms')} style={{ flex: '1 1 auto', minWidth: '150px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'cms' ? '#38bdf8' : '#111', color: activeTab === 'cms' ? '#000' : '#888', border: '1px solid #333' }}>
          🌐 Website CMS (Portfolio & Gear)
        </button>
        <button onClick={() => setActiveTab('galleries')} style={{ flex: '1 1 auto', minWidth: '130px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'galleries' ? '#fff' : '#111', color: activeTab === 'galleries' ? '#000' : '#888', border: '1px solid #333' }}>
          🎬 Client Deliveries
        </button>
      </div>

      {statusMsg && (
        <div className="no-print" style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: statusMsg.type === 'success' ? '#14532d' : '#7f1d1d', color: '#fff', fontSize: '13px' }}>
          {statusMsg.text}
        </div>
      )}

      {/* ===================== TAB 1: WEBSITE CMS ===================== */}
      {activeTab === 'cms' && (
        <div className="no-print">
          {/* CMS Sub-Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', backgroundColor: '#0a0a0a', padding: '6px', borderRadius: '8px', border: '1px solid #222' }}>
            <button onClick={() => setCmsSubTab('portfolio')} style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'portfolio' ? '#fff' : 'transparent', color: cmsSubTab === 'portfolio' ? '#000' : '#888', border: 'none' }}>
              🎥 Portfolio Projects ({cmsPortfolioList.length})
            </button>
            <button onClick={() => setCmsSubTab('gear')} style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'gear' ? '#fff' : 'transparent', color: cmsSubTab === 'gear' ? '#000' : '#888', border: 'none' }}>
              ⚙️ Gear Kit Arsenal ({cmsGearList.length})
            </button>
            <button onClick={() => setCmsSubTab('timeline')} style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'timeline' ? '#fff' : 'transparent', color: cmsSubTab === 'timeline' ? '#000' : '#888', border: 'none' }}>
              ⏱️ Timeline Experience ({cmsTimelineList.length})
            </button>
          </div>

          {/* SUB-SECTION 1: PORTFOLIO CMS */}
          {cmsSubTab === 'portfolio' && (
            <div>
              <form onSubmit={handlePortfolioSubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>
                  {editingPortId ? 'EDIT PORTFOLIO PROJECT' : 'ADD NEW PORTFOLIO PROJECT'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>PROJECT TITLE</label>
                    <input type="text" required value={portTitle} onChange={(e) => setPortTitle(e.target.value)} placeholder="e.g. WHAT A FINALIST FEELS LIKE" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>CATEGORY</label>
                    <select value={portCategory} onChange={(e) => setPortCategory(e.target.value as any)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                      <option value="video">Digital Cinema / Commercial Video</option>
                      <option value="live">Live Multi-Camera Broadcast</option>
                    </select>
                  </div>
                </div>

                {/* VIDEO SOURCE & SUPABASE DIRECT STORAGE UPLOAD */}
                <div style={{ backgroundColor: '#18181b', padding: '12px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    VIDEO URL (Supabase Storage .mp4 or YouTube Embed)
                  </label>
                  <input
                    type="text"
                    required
                    value={portVideoSrc}
                    onChange={(e) => setPortVideoSrc(e.target.value)}
                    placeholder="https://baslngnfxzexrosegisj.supabase.co/storage/v1/object/public/portfolio-videos/... or YouTube Embed"
                    style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa', cursor: 'pointer', backgroundColor: '#27272a', padding: '6px 12px', borderRadius: '4px', border: '1px solid #3f3f46' }}>
                      📁 Upload New Reel to Supabase Storage
                      <input type="file" accept="video/mp4,video/quicktime" onChange={handleDirectReelUpload} style={{ display: 'none' }} />
                    </label>
                    {uploadingVideo && <span style={{ fontSize: '11px', color: '#38bdf8', fontStyle: 'italic' }}>Uploading to bucket...</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>PRODUCTION ROLE</label>
                    <input type="text" required value={portRole} onChange={(e) => setPortRole(e.target.value)} placeholder="e.g. Director of Photography • Lead Editor" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>EQUIPMENT / PIPELINE (Comma-separated)</label>
                    <input type="text" value={portEquipment} onChange={(e) => setPortEquipment(e.target.value)} placeholder="Sony A7III, DaVinci Resolve Studio" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#888' }}>DESCRIPTION</label>
                  <textarea rows={2} required value={portDesc} onChange={(e) => setPortDesc(e.target.value)} placeholder="Detailed project overview..." style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input type="checkbox" id="verticalCheck" checked={portIsVertical} onChange={(e) => setPortIsVertical(e.target.checked)} style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }} />
                  <label htmlFor="verticalCheck" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>
                    Vertical Video (9:16 Aspect Ratio format)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'SAVING...' : editingPortId ? 'UPDATE PROJECT' : 'ADD TO PORTFOLIO'}
                  </button>
                  {editingPortId && (
                    <button type="button" onClick={resetPortfolioForm} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              {/* LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cmsPortfolioList.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Category: <strong>{item.category}</strong> | Role: {item.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditPortfolio(item)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button onClick={() => handleDeletePortfolio(item.id!)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION 2: GEAR CMS */}
          {cmsSubTab === 'gear' && (
            <div>
              <form onSubmit={handleGearSubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>
                  {editingGearId ? 'EDIT GEAR ITEM' : 'ADD NEW GEAR ITEM'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>HARDWARE NAME</label>
                    <input type="text" required value={gearName} onChange={(e) => setGearName(e.target.value)} placeholder="e.g. Blackmagic ATEM 2 M/E" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>CATEGORY / LABEL</label>
                    <input type="text" required value={gearCategory} onChange={(e) => setGearCategory(e.target.value)} placeholder="e.g. Production Switchers" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>FILTER TAG</label>
                    <select value={gearTag} onChange={(e) => setGearTag(e.target.value as any)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                      <option value="vision">Vision & Switching</option>
                      <option value="cinema">Cinema Cameras & Rigging</option>
                      <option value="wireless">Wireless Transmission</option>
                      <option value="audio">Audio Chain</option>
                      <option value="aerial">Aerial Drones</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', color: '#888' }}>DESCRIPTION</label>
                  <textarea rows={2} required value={gearDesc} onChange={(e) => setGearDesc(e.target.value)} placeholder="Technical specifications and use case..." style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'SAVING...' : editingGearId ? 'UPDATE GEAR' : 'ADD TO ARSENAL'}
                  </button>
                  {editingGearId && (
                    <button type="button" onClick={resetGearForm} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cmsGearList.map((g) => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{g.name}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Tag: <strong>{g.tag}</strong> | Category: {g.category}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditGear(g)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button onClick={() => handleDeleteGear(g.id!)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION 3: TIMELINE CMS */}
          {cmsSubTab === 'timeline' && (
            <div>
              <form onSubmit={handleTimelineSubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>
                  {editingExpId ? 'EDIT EXPERIENCE MILESTONE' : 'ADD NEW MILESTONE'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>TIMEFRAME</label>
                    <input type="text" required value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="e.g. 2023 - Present" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>ROLE TITLE</label>
                    <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Lead Technical Director" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888' }}>ORGANIZATION</label>
                    <input type="text" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="e.g. Pan-Atlantic University" style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', color: '#888' }}>RESPONSIBILITIES (One per line)</label>
                  <textarea rows={3} required value={expResponsibilities} onChange={(e) => setExpResponsibilities(e.target.value)} placeholder="Managed 6 camera feeds...&#10;Operated ATEM 2 M/E switcher..." style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'SAVING...' : editingExpId ? 'UPDATE MILESTONE' : 'ADD MILESTONE'}
                  </button>
                  {editingExpId && (
                    <button type="button" onClick={resetTimelineForm} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cmsTimelineList.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{t.title} ({t.year})</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{t.company}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditTimeline(t)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button onClick={() => handleDeleteTimeline(t.id!)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: INVOICES ===================== */}
      {activeTab === 'invoices' && (
        <div>
          <div className="no-print" style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>INVOICE & AGREEMENT BUILDER</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', maxWidth: '420px' }}>
                <button type="button" onClick={() => setPrintDocumentMode('invoice')} style={{ flex: '1 1 auto', padding: '8px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: printDocumentMode === 'invoice' ? '#fff' : '#222', color: printDocumentMode === 'invoice' ? '#000' : '#888', border: '1px solid #444' }}>
                  👁 Preview Invoice
                </button>
                <button type="button" onClick={() => setPrintDocumentMode('contract')} style={{ flex: '1 1 auto', padding: '8px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: printDocumentMode === 'contract' ? '#38bdf8' : '#222', color: printDocumentMode === 'contract' ? '#000' : '#888', border: '1px solid #444' }}>
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
                <label style={{ fontSize: '11px', color: '#888' }}>PAYMENT DUE DATE</label>
                <input type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* INVOICE META ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CLIENT / COMPANY</label>
                <input type="text" value={invClientName} onChange={(e) => setInvClientName(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>CLIENT EMAIL</label>
                <input type="email" value={invClientEmail} onChange={(e) => setInvClientEmail(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>FOR (PROJECT / EVENT)</label>
                <input type="text" value={invProjectFor} onChange={(e) => setInvProjectFor(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
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
                TAXABLE SERVICE LINE ITEMS
              </label>
              {invItems.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '6px', border: '1px solid #222', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" placeholder="Line item title" value={item.description} onChange={(e) => { const u = [...invItems]; u[idx].description = e.target.value; setInvItems(u); }} style={{ flex: 1, padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '13px' }} />
                    {invItems.length > 1 && (
                      <button type="button" onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))} style={{ padding: '8px 14px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                    <input type="number" placeholder="Qty" value={item.quantity === 0 ? '' : item.quantity} onChange={(e) => { const u = [...invItems]; u[idx].quantity = parseFloat(e.target.value) || 0; setInvItems(u); }} style={{ padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                    <input type="number" placeholder="Unit Price" value={item.rate === 0 ? '' : item.rate} onChange={(e) => { const u = [...invItems]; u[idx].rate = parseFloat(e.target.value) || 0; setInvItems(u); }} style={{ padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#38bdf8', borderRadius: '4px', fontWeight: 'bold' }} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setInvItems([...invItems, { description: '', sub_description: '', quantity: 1, rate: 0 }])} style={{ width: '100%', padding: '10px', fontSize: '12px', backgroundColor: '#18181b', color: '#fff', border: '1px dashed #444', borderRadius: '6px', cursor: 'pointer' }}>
                + Add Another Line Item
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => window.print()} style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                🖨️ PRINT PREVIEW
              </button>
            </div>
          </div>

          {/* PRINTABLE AREA */}
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            {printDocumentMode === 'invoice' && (
              <div id="printable-invoice-document" style={{ minWidth: '700px', backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, color: '#000' }}>INVOICE</h1>
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
      )}

      {/* ===================== TAB 3: CLIENT DELIVERIES ===================== */}
      {activeTab === 'galleries' && (
        <div className="no-print">
          <p style={{ color: '#888', fontSize: '13px' }}>Client portal management is active.</p>
        </div>
      )}
    </div>
  );
};

export default Admin;