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
  const [invExtraFeeLabel, setInvExtraFeeLabel] = useState<string>('Delivery & Logistics');
  const [invExtraFeeAmount, setInvExtraFeeAmount] = useState<number>(0);
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { description: 'Service Line Item', sub_description: '', quantity: 1, rate: 0 }
  ]);
  const [invNotes, setInvNotes] = useState('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');
  const [includeTerms, setIncludeTerms] = useState(true);

  // Separate Agreement Customization States
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
      setContractCustomTerms('Client guarantees scheduled access to locations and timely feedback on rough cuts.');
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
      console.error(err);
    }
  };

  const fetchCmsGear = async () => {
    try {
      const { data, error } = await supabase.from('gear_items').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setCmsGearList(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchCmsTimeline = async () => {
    try {
      const { data, error } = await supabase.from('experience_timeline').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setCmsTimelineList(data);
    } catch (err: any) {
      console.error(err);
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
    if (!id && id !== 0) return;
    if (!window.confirm('Delete this portfolio project?')) return;
    try {
      setCmsPortfolioList((prev) => prev.filter((p) => p.id !== id));
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: 'Portfolio project deleted successfully.' });
      fetchCmsPortfolio();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
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
    setInvExtraFeeLabel('Delivery & Logistics');
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
    setInvExtraFeeLabel(inv.extra_fee_label || 'Delivery & Logistics');
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
              style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', textAlign: 'center', fontSize: '1.2rem', marginBottom: '16px', boxSizing: 'border-box' }}
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
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '24px 14px', color: '#fff', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>TONYSHOTIT STUDIOS</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '11px' }}>MANAGEMENT DASHBOARD • BN: 9926513 • TIN: 2622415188316</p>
        </div>
        <button onClick={() => setIsAdminAuthenticated(false)} style={{ padding: '8px 14px', backgroundColor: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          🔒 Lock Studio
        </button>
      </div>

      {/* TOP TABS */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('invoices')} style={{ flex: '1 1 auto', minWidth: '150px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'invoices' ? '#fff' : '#111', color: activeTab === 'invoices' ? '#000' : '#888', border: '1px solid #333' }}>
          🧾 Invoices & Agreements ({invoices.length})
        </button>
        <button onClick={() => setActiveTab('cms')} style={{ flex: '1 1 auto', minWidth: '150px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'cms' ? '#38bdf8' : '#111', color: activeTab === 'cms' ? '#000' : '#888', border: '1px solid #333' }}>
          🌐 Website CMS (Portfolio & Gear)
        </button>
        <button onClick={() => setActiveTab('galleries')} style={{ flex: '1 1 auto', minWidth: '130px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'galleries' ? '#fff' : '#111', color: activeTab === 'galleries' ? '#000' : '#888', border: '1px solid #333' }}>
          🎬 Client Deliveries ({projects.length})
        </button>
      </div>

      {statusMsg && (
        <div className="no-print" style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: statusMsg.type === 'success' ? '#14532d' : '#7f1d1d', color: '#fff', fontSize: '13px' }}>
          {statusMsg.text}
        </div>
      )}

      {/* ===================== TAB 1: INVOICES & AGREEMENTS ===================== */}
      {activeTab === 'invoices' && (
        <div>
          <div className="no-print" style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px', boxSizing: 'border-box' }}>
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
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>INVOICE NUMBER</label>
                <input type="text" value={invNumber} onChange={(e) => setInvNumber(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ISSUE DATE</label>
                <input type="date" value={invIssueDate} onChange={(e) => setInvIssueDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>PAYMENT DUE DATE</label>
                <input type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* INVOICE META ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CLIENT / COMPANY</label>
                <input type="text" value={invClientName} onChange={(e) => setInvClientName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CLIENT EMAIL</label>
                <input type="email" value={invClientEmail} onChange={(e) => setInvClientEmail(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>FOR (PROJECT / EVENT)</label>
                <input type="text" value={invProjectFor} onChange={(e) => setInvProjectFor(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* INVOICE META ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CURRENCY</label>
                <select value={invCurrency} onChange={(e) => setInvCurrency(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>STATUS</label>
                <select value={invStatus} onChange={(e) => setInvStatus(e.target.value as any)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>BANK NAME</label>
                <input type="text" value={invBankName} onChange={(e) => setInvBankName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ACCOUNT NO.</label>
                <input type="text" value={invAccountNumber} onChange={(e) => setInvAccountNumber(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* LINE ITEMS - STABLE ON MOBILE */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                TAXABLE SERVICE LINE ITEMS
              </label>
              {invItems.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '6px', border: '1px solid #222', marginBottom: '10px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Line item title" 
                      value={item.description} 
                      onChange={(e) => { const u = [...invItems]; u[idx].description = e.target.value; setInvItems(u); }} 
                      style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '13px' }} 
                    />
                    {invItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))} 
                        style={{ padding: '8px 14px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      placeholder="Qty" 
                      value={item.quantity === 0 ? '' : item.quantity} 
                      onChange={(e) => { const u = [...invItems]; u[idx].quantity = parseFloat(e.target.value) || 0; setInvItems(u); }} 
                      style={{ width: '85px', flexShrink: 0, boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', textAlign: 'center' }} 
                    />
                    <input 
                      type="number" 
                      placeholder="Unit Price" 
                      value={item.rate === 0 ? '' : item.rate} 
                      onChange={(e) => { const u = [...invItems]; u[idx].rate = parseFloat(e.target.value) || 0; setInvItems(u); }} 
                      style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#38bdf8', borderRadius: '4px', fontWeight: 'bold' }} 
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setInvItems([...invItems, { description: '', sub_description: '', quantity: 1, rate: 0 }])} style={{ width: '100%', padding: '10px', fontSize: '12px', backgroundColor: '#18181b', color: '#fff', border: '1px dashed #444', borderRadius: '6px', cursor: 'pointer' }}>
                + Add Another Line Item
              </button>
            </div>

            {/* FINANCIAL ADJUSTMENTS: DISCOUNT, VAT & LOGISTICS LINE */}
            <div style={{ backgroundColor: '#0a0a0a', padding: '14px', borderRadius: '6px', border: '1px solid #222', marginBottom: '16px', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
                Discounts, VAT & Disbursements
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DISCOUNT ({currencySymbol.trim()})</label>
                  <input
                    type="number"
                    value={invDiscount === 0 ? '' : invDiscount}
                    onChange={(e) => setInvDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>VAT / TAX PERCENT (%)</label>
                  <input
                    type="number"
                    value={invTaxPercent === 0 ? '' : invTaxPercent}
                    onChange={(e) => setInvTaxPercent(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 7.5"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="showVatRow"
                  checked={showVatRow}
                  onChange={(e) => setShowVatRow(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }}
                />
                <label htmlFor="showVatRow" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>
                  Show VAT row on invoice (check to include explicit tax row or small business exemption)
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>EXTRA DISBURSEMENT / DELIVERY LABEL</label>
                  <input
                    type="text"
                    value={invExtraFeeLabel}
                    onChange={(e) => setInvExtraFeeLabel(e.target.value)}
                    placeholder="Delivery & Logistics"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>EXTRA FEE AMOUNT ({currencySymbol.trim()})</label>
                  <input
                    type="number"
                    value={invExtraFeeAmount === 0 ? '' : invExtraFeeAmount}
                    onChange={(e) => setInvExtraFeeAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* SEPARATE AGREEMENT EDITOR SECTION */}
            <div style={{ backgroundColor: '#0a0a0a', padding: '16px', borderRadius: '6px', border: '1px solid #222', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                  Agreement & Production Contract Terms
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('broadcast')}
                    style={{ padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: contractTypePreset === 'broadcast' ? '#38bdf8' : '#222', color: contractTypePreset === 'broadcast' ? '#000' : '#888', border: '1px solid #444' }}
                  >
                    Broadcast Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('video_edit')}
                    style={{ padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: contractTypePreset === 'video_edit' ? '#38bdf8' : '#222', color: contractTypePreset === 'video_edit' ? '#000' : '#888', border: '1px solid #444' }}
                  >
                    Cinema Preset
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>AGREEMENT TITLE</label>
                  <input type="text" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>FULFILLMENT / PRODUCTION WINDOW</label>
                  <input type="text" value={contractFulfillmentWindow} onChange={(e) => setContractFulfillmentWindow(e.target.value)} placeholder="e.g. October 24 – 26, 2026" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>SCOPE OF WORK</label>
                <textarea rows={2} value={contractScope} onChange={(e) => setContractScope(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DELIVERABLES</label>
                <textarea rows={3} value={contractDeliverables} onChange={(e) => setContractDeliverables(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DEPOSIT PERCENT (%)</label>
                  <input type="number" value={depositPercent} onChange={(e) => setDepositPercent(parseFloat(e.target.value) || 0)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CLIENT SIGNER NAME</label>
                  <input type="text" value={contractSignerName} onChange={(e) => setContractSignerName(e.target.value)} placeholder="e.g. Engr. Babatunde Alabi" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>FINAL PAYMENT TRIGGER</label>
                <input type="text" value={finalPaymentTrigger} onChange={(e) => setFinalPaymentTrigger(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="includeEquipmentSafety"
                  checked={includeEquipmentSafety}
                  onChange={(e) => setIncludeEquipmentSafety(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }}
                />
                <label htmlFor="includeEquipmentSafety" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>
                  Include on-site hardware protection and attendee liability clause
                </label>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CUSTOM TERMS & CLIENT OBLIGATIONS</label>
                <textarea rows={2} value={contractCustomTerms} onChange={(e) => setContractCustomTerms(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            {/* INVOICE REMINDERS & NOTES */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <input
                  type="checkbox"
                  id="includeTerms"
                  checked={includeTerms}
                  onChange={(e) => setIncludeTerms(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }}
                />
                <label htmlFor="includeTerms" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>
                  Include formal terms of service & payment conditions on printed document
                </label>
              </div>
              <textarea
                rows={2}
                value={invNotes}
                onChange={(e) => setInvNotes(e.target.value)}
                placeholder="Invoice notes, wire instructions or special reminders..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={handleInvoiceSubmit} disabled={loading} style={{ flex: 2, minWidth: '150px', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'SAVING...' : editingInvoiceId ? 'UPDATE RECORD' : 'SAVE TO DATABASE'}
              </button>
              <button type="button" onClick={() => { setPrintDocumentMode('invoice'); setTimeout(() => window.print(), 100); }} style={{ flex: 1, minWidth: '130px', padding: '12px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                🖨️ PRINT INVOICE
              </button>
              <button type="button" onClick={() => { setPrintDocumentMode('contract'); setTimeout(() => window.print(), 100); }} style={{ flex: 1, minWidth: '130px', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                📄 PRINT AGREEMENT
              </button>
            </div>
          </div>

          {/* VISIBLE LIVE PREVIEW DOCUMENT CONTAINER */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
                DOCUMENT PREVIEW: {printDocumentMode === 'invoice' ? 'OFFICIAL INVOICE' : 'PRODUCTION AGREEMENT'}
              </h3>
              <span style={{ fontSize: '11px', color: '#888' }}>Live preview updates in real time</span>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', padding: '4px' }}>
              
              {/* LIVE INVOICE PREVIEW */}
              {printDocumentMode === 'invoice' && (
                <div id="printable-invoice-document" style={{ minWidth: '700px', backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, color: '#000', letterSpacing: '-0.5px' }}>INVOICE</h1>
                      <p style={{ margin: '6px 0 2px 0', fontSize: '13px', color: '#222' }}><strong>Invoice No:</strong> {invNumber}</p>
                      <p style={{ margin: '2px 0', fontSize: '13px', color: '#222' }}><strong>Date:</strong> {invIssueDate}</p>
                      {invDueDate && <p style={{ margin: '2px 0', fontSize: '13px', color: '#b91c1c' }}><strong>Due Date:</strong> {invDueDate}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, color: '#000' }}>TONYSHOTIT STUDIOS</h2>
                      <p style={{ margin: '2px 0', fontSize: '11px', color: '#444' }}>Live Broadcast & Commercial Digital Cinema</p>
                      <p style={{ margin: '2px 0', fontSize: '11px', color: '#444' }}>RC/BN: 9926513 • TIN: 2622415188316</p>
                      <p style={{ margin: '2px 0', fontSize: '11px', color: '#444' }}>anthony@tonyshotit.com • tonyshotit.com</p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '2px solid #000', marginBottom: '20px' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold', margin: '0 0 4px 0' }}>BILLED TO</p>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#000' }}>{invClientName || 'Client Name / Organization'}</h3>
                      {invClientEmail && <p style={{ fontSize: '12px', margin: '2px 0', color: '#333' }}>{invClientEmail}</p>}
                      {invProjectFor && <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#0284c7', fontWeight: 600 }}>Project: {invProjectFor}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: invStatus === 'Paid' ? '#dcfce7' : '#fef3c7', color: invStatus === 'Paid' ? '#15803d' : '#b45309', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        STATUS: {invStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', width: '55%' }}>Description</th>
                        <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', width: '15%' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', width: '15%' }}>Unit Rate</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', width: '15%' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e5e5' }}>
                          <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                            <strong>{item.description || 'Service line item'}</strong>
                            {item.sub_description && <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{item.sub_description}</div>}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 12px', fontSize: '12px' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px' }}>{currencySymbol}{(item.rate || 0).toLocaleString()}</td>
                          <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', fontWeight: 'bold' }}>{currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                    <div style={{ width: '380px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                        <span style={{ color: '#555' }}>Services Subtotal</span>
                        <span style={{ fontWeight: 600 }}>{currencySymbol}{servicesSubtotal.toLocaleString()}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid #eee', color: '#16a34a' }}>
                          <span>Discount Applied</span>
                          <span>- {currencySymbol}{discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      {showVatRow && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                          <span style={{ color: '#555' }}>VAT ({safeTaxPercent}%)</span>
                          <span>{safeTaxPercent > 0 ? `${currencySymbol}${taxAmount.toLocaleString()}` : '0.00 (Small Business Exempt)'}</span>
                        </div>
                      )}

                      {extraFeeAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                          <span style={{ color: '#555' }}>{invExtraFeeLabel || 'Delivery & Logistics'}</span>
                          <span style={{ fontWeight: 600 }}>{currencySymbol}{extraFeeAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, padding: '10px 0', borderBottom: '2px solid #000' }}>
                        <span>GRAND TOTAL</span>
                        <span>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', textTransform: 'uppercase', color: '#111', fontWeight: 'bold' }}>Remittance / Banking Instructions</h4>
                    <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Bank:</strong> {invBankName}</p>
                    <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Account Number:</strong> {invAccountNumber}</p>
                    <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Account Name:</strong> {invAccountName}</p>
                  </div>

                  {includeTerms && (
                    <div style={{ fontSize: '10px', color: '#666', borderTop: '1px solid #eee', paddingTop: '12px', lineHeight: 1.5 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#333' }}>TERMS & CONDITIONS:</p>
                      <p style={{ margin: '0 0 2px 0' }}>1. A standard {depositPercent}% non-refundable commitment deposit confirms booking and equipment reservation.</p>
                      <p style={{ margin: '0 0 2px 0' }}>2. Overtime beyond agreed call-sheet hours is billed at {overtimeRateFormatted} per additional hour.</p>
                      <p style={{ margin: '0 0 2px 0' }}>3. Full high-resolution media master release occurs upon 100% final balance settlement.</p>
                      {invNotes && <p style={{ margin: '6px 0 0 0', fontStyle: 'italic', color: '#444' }}>Notes: {invNotes}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* LIVE AGREEMENT PREVIEW */}
              {printDocumentMode === 'contract' && (
                <div id="printable-contract-document" style={{ minWidth: '700px', backgroundColor: '#fff', color: '#000', padding: '40px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px 0', textTransform: 'uppercase', color: '#000' }}>
                      {contractTitle}
                    </h1>
                    <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>Reference Document: {invNumber} • Effective Date: {invIssueDate}</p>
                  </div>

                  <hr style={{ border: 'none', borderTop: '2px solid #000', marginBottom: '20px' }} />

                  <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#222' }}>
                    <p style={{ marginBottom: '14px' }}>
                      This Agreement is executed between <strong>TONYSHOTIT STUDIOS</strong> (BN: 9926513 • TIN: 2622415188316), hereinafter referred to as the "Service Provider," and <strong>{invClientName || 'Client / Organization'}</strong>, hereinafter referred to as the "Client."
                    </p>

                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '14px 0 4px 0' }}>1. Scope of Engagement & Equipment Schedule</h4>
                    <p style={{ margin: '0 0 8px 0' }}>{contractScope}</p>
                    {contractFulfillmentWindow && <p style={{ margin: '0 0 8px 0' }}><strong>Production Window:</strong> {contractFulfillmentWindow}</p>}

                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '14px 0 4px 0' }}>2. Master Deliverables & Archival Handoff</h4>
                    <div style={{ whiteSpace: 'pre-line', margin: '0 0 8px 0' }}>{contractDeliverables}</div>

                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '14px 0 4px 0' }}>3. Financial Consideration & Milestone Schedule</h4>
                    <p style={{ margin: '0 0 4px 0' }}>Total Contract Sum: <strong>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</strong></p>
                    <p style={{ margin: '0 0 4px 0' }}>• Initial Deposit ({safeDepositPercent}%): <strong>{currencySymbol}{depositAmount.toLocaleString()}</strong> due upon contract signing to lock dates and crew availability.</p>
                    <p style={{ margin: '0 0 8px 0' }}>• Final Balance: <strong>{currencySymbol}{balanceAmount.toLocaleString()}</strong>. {finalPaymentTrigger}</p>

                    {includeEquipmentSafety && (
                      <>
                        <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '14px 0 4px 0' }}>4. On-Site Hardware Security & Production Environment</h4>
                        <p style={{ margin: '0 0 8px 0' }}>{contractCustomTerms}</p>
                      </>
                    )}

                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '14px 0 4px 0' }}>5. Execution & Acceptance</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '36px' }}>
                      <div style={{ borderTop: '1px solid #000', paddingTop: '8px' }}>
                        <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>TONYSHOTIT STUDIOS</p>
                        <p style={{ margin: '0', fontSize: '11px', color: '#555' }}>Authorized Signature / Technical Director</p>
                      </div>

                      <div style={{ borderTop: '1px solid #000', paddingTop: '8px' }}>
                        <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{contractSignerName || invClientName || 'Authorized Client Representative'}</p>
                        <p style={{ margin: '0', fontSize: '11px', color: '#555' }}>Signature & Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INVOICE SAVED RECORDS */}
          <div className="no-print" style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>SAVED INVOICES ({invoices.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{inv.invoice_number} • {inv.client_name}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Total: {inv.currency || 'NGN'} {(inv.items?.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0) || 0).toLocaleString()} • Status: {inv.status}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleEditInvoice(inv)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button type="button" onClick={() => handleDeleteInvoice(inv.id)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', backgroundColor: '#0a0a0a', padding: '6px', borderRadius: '8px', border: '1px solid #222', overflowX: 'auto' }}>
            <button onClick={() => setCmsSubTab('portfolio')} style={{ flex: 1, minWidth: '120px', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'portfolio' ? '#fff' : 'transparent', color: cmsSubTab === 'portfolio' ? '#000' : '#888', border: 'none' }}>
              🎥 Portfolio Projects ({cmsPortfolioList.length})
            </button>
            <button onClick={() => setCmsSubTab('gear')} style={{ flex: 1, minWidth: '120px', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'gear' ? '#fff' : 'transparent', color: cmsSubTab === 'gear' ? '#000' : '#888', border: 'none' }}>
              ⚙️ Gear Kit Arsenal ({cmsGearList.length})
            </button>
            <button onClick={() => setCmsSubTab('timeline')} style={{ flex: 1, minWidth: '120px', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: cmsSubTab === 'timeline' ? '#fff' : 'transparent', color: cmsSubTab === 'timeline' ? '#000' : '#888', border: 'none' }}>
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
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>PROJECT TITLE</label>
                    <input type="text" required value={portTitle} onChange={(e) => setPortTitle(e.target.value)} placeholder="e.g. WHAT A FINALIST FEELS LIKE" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CATEGORY</label>
                    <select value={portCategory} onChange={(e) => setPortCategory(e.target.value as any)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                      <option value="video">Digital Cinema / Commercial Video</option>
                      <option value="live">Live Multi-Camera Broadcast</option>
                    </select>
                  </div>
                </div>

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
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }}
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
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>PRODUCTION ROLE</label>
                    <input type="text" required value={portRole} onChange={(e) => setPortRole(e.target.value)} placeholder="e.g. Director of Photography • Lead Editor" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>EQUIPMENT / PIPELINE (Comma-separated)</label>
                    <input type="text" value={portEquipment} onChange={(e) => setPortEquipment(e.target.value)} placeholder="Sony A7III, DaVinci Resolve Studio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DESCRIPTION</label>
                  <textarea rows={2} required value={portDesc} onChange={(e) => setPortDesc(e.target.value)} placeholder="Detailed project overview..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cmsPortfolioList.map((item) => (
                  <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Category: <strong>{item.category}</strong> | Role: {item.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleEditPortfolio(item)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button type="button" onClick={() => handleDeletePortfolio(Number(item.id))} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
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
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>HARDWARE NAME</label>
                    <input type="text" required value={gearName} onChange={(e) => setGearName(e.target.value)} placeholder="e.g. Blackmagic ATEM 2 M/E" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CATEGORY / LABEL</label>
                    <input type="text" required value={gearCategory} onChange={(e) => setGearCategory(e.target.value)} placeholder="e.g. Production Switchers" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>FILTER TAG</label>
                    <select value={gearTag} onChange={(e) => setGearTag(e.target.value as any)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                      <option value="vision">Vision & Switching</option>
                      <option value="cinema">Cinema Cameras & Rigging</option>
                      <option value="wireless">Wireless Transmission</option>
                      <option value="audio">Audio Chain</option>
                      <option value="aerial">Aerial Drones</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DESCRIPTION</label>
                  <textarea rows={2} required value={gearDesc} onChange={(e) => setGearDesc(e.target.value)} placeholder="Technical specifications..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
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
                  <div key={g.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{g.name}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Tag: <strong>{g.tag}</strong> | Category: {g.category}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleEditGear(g)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button type="button" onClick={() => handleDeleteGear(Number(g.id))} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
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
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>TIMEFRAME</label>
                    <input type="text" required value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="e.g. 2023 - Present" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ROLE TITLE</label>
                    <input type="text" required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Lead Technical Director" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ORGANIZATION</label>
                    <input type="text" required value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="e.g. Pan-Atlantic University" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>RESPONSIBILITIES (One per line)</label>
                  <textarea rows={3} required value={expResponsibilities} onChange={(e) => setExpResponsibilities(e.target.value)} placeholder="Managed 6 camera feeds...&#10;Operated ATEM 2 M/E switcher..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
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
                  <div key={t.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #222', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff' }}>{t.title} ({t.year})</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{t.company}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleEditTimeline(t)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      <button type="button" onClick={() => handleDeleteTimeline(Number(t.id))} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: CLIENT DELIVERIES ===================== */}
      {activeTab === 'galleries' && (
        <div className="no-print">
          <form onSubmit={handleGallerySubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>
              {editingProjectId ? 'EDIT CLIENT GALLERY LINK' : 'CREATE NEW CLIENT DELIVERY GALLERY'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>CLIENT / ORGANIZATION</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Pan-Atlantic University" style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>PROJECT TITLE</label>
                <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Convocation 2026 Master Delivery" style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>URL SLUG (tonyshotit.com/client/[slug])</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. pau-convocation" style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>CLIENT ACCESS PIN</label>
                <input type="text" required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="e.g. 2026" style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px', borderTop: '1px solid #222', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold' }}>VIDEO STREAMS ({videos.length})</label>
                <button type="button" onClick={() => setVideos([...videos, { title: `Stream ${videos.length + 1}`, url: '' }])} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>
                  + Add Another Video Stream
                </button>
              </div>

              {videos.map((vid, idx) => (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Title (e.g. Day 1 Morning Session)" value={vid.title} onChange={(e) => { const updated = [...videos]; updated[idx].title = e.target.value; setVideos(updated); }} style={{ flex: '1 1 140px', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  <input type="text" placeholder="Direct Video URL (.mp4 or embed)" value={vid.url} onChange={(e) => { const updated = [...videos]; updated[idx].url = e.target.value; setVideos(updated); }} style={{ flex: '2 1 200px', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  {videos.length > 1 && (
                    <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== idx))} style={{ padding: '8px 12px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>FULL RESOLUTION DOWNLOAD LINK (Google Drive / Dropbox ZIP)</label>
              <input type="text" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>DIRECTOR NOTES & HANDOFF INSTRUCTIONS</label>
              <textarea rows={3} value={directorNotes} onChange={(e) => setDirectorNotes(e.target.value)} placeholder="Notes for the client regarding download expiry, revisions, or color profiles..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, minWidth: '160px', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? 'SAVING...' : editingProjectId ? 'UPDATE GALLERY LINK' : 'PUBLISH CLIENT GALLERY'}
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
            ACTIVE CLIENT GALLERIES ({projects.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: '6px', border: '1px solid #222', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff' }}>{proj.client_name} - {proj.project_title}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Slug: <code style={{ color: '#38bdf8' }}>/client/{proj.slug}</code> | PIN: <strong style={{ color: '#fff' }}>{proj.pin}</strong></p>
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
    </div>
  );
};

export default Admin;