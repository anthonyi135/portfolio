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

type InvoiceStatus = 'Paid' | 'Sent' | 'Part Payment' | 'Declined' | 'Draft';

interface Invoice {
  id?: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address?: string;
  project_for?: string;
  issue_date: string;
  due_date: string;
  currency: string;
  status: InvoiceStatus;
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
  const [invClientAddress, setInvClientAddress] = useState('');
  const [invProjectFor, setInvProjectFor] = useState('');
  const [invIssueDate, setInvIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState('');
  const [invCurrency, setInvCurrency] = useState('NGN');
  const [invStatus, setInvStatus] = useState<InvoiceStatus>('Sent');
  const [invBankName, setInvBankName] = useState('Moniepoint MFB');
  const [invAccountNumber, setInvAccountNumber] = useState('6478474528');
  const [invAccountName, setInvAccountName] = useState('Tonyshotit Studios - Anthony Ibuzo');

  // Financial Controls
  const [invDiscount, setInvDiscount] = useState<number>(0);
  const [invTaxPercent, setInvTaxPercent] = useState<number>(0);
  const [showVatRow, setShowVatRow] = useState<boolean>(true);
  const [invExtraFeeLabel, setInvExtraFeeLabel] = useState<string>('Transportation and Logistics');
  const [invExtraFeeAmount, setInvExtraFeeAmount] = useState<number>(0);
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { description: 'On-site location shooting', sub_description: '', quantity: 1, rate: 0 }
  ]);
  const [invNotes, setInvNotes] = useState('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');
  const [includeTerms, setIncludeTerms] = useState<boolean>(true);

  // Sub-Section: Agreement Contract Settings
  const [showAgreementEditor, setShowAgreementEditor] = useState(false);
  const [contractTypePreset, setContractTypePreset] = useState<'video_edit' | 'broadcast'>('video_edit');
  const [contractTitle, setContractTitle] = useState('CINEMATOGRAPHY & VIDEO PRODUCTION AGREEMENT');
  const [contractFulfillmentWindow, setContractFulfillmentWindow] = useState('Through Project/Event Conclusion. Final edits delivered within 5 business days post-event.');
  const [contractScope, setContractScope] = useState('On-site cinematography, sound capture, lighting execution, and multi-stage post-production editing.');
  const [contractDeliverables, setContractDeliverables] = useState('4 Fully Edited Videos:\n• Highlight Event Video\n• Interview Session Video\n• Social Media Reel Deliverable\n*Includes up to 2 rounds of minor editorial revisions.');
  const [depositPercent, setDepositPercent] = useState<number>(70);
  const [finalPaymentTrigger, setFinalPaymentTrigger] = useState('Final 30% balance is due upon presentation of draft preview exports. Final, unwatermarked high-resolution masters and full asset release occur strictly upon confirmation of 100% balance settlement.');
  const [contractCustomTerms, setContractCustomTerms] = useState('• Overtime: On-site coverage exceeding the agreed scope window will be billed at an additional rate of NGN 25,000 per hour (or part thereof).\n• Rescheduling: Date changes requested less than 48 hours prior to call time forfeit the initial commitment deposit and require a new booking fee subject to crew and gear availability.\n• Asset & Media Rights: All raw captured media, working project files, and intellectual property remain the sole property of Tonyshotit Studio until the total project fee is paid in full. Previews are supplied for client approval purposes only.\n• Cancellation: Cancellations inside 48 hours of scheduled call time strictly forfeit the initial commitment deposit to cover equipment holding and crew retainers.');
  const [contractSignerName, setContractSignerName] = useState('');
  const [printDocumentMode, setPrintDocumentMode] = useState<'invoice' | 'contract'>('invoice');

  // CMS States
  const [cmsSubTab, setCmsSubTab] = useState<'portfolio' | 'gear' | 'timeline'>('portfolio');
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

  const [cmsGearList, setCmsGearList] = useState<GearItemCMS[]>([]);
  const [editingGearId, setEditingGearId] = useState<number | null>(null);
  const [gearName, setGearName] = useState('');
  const [gearCategory, setGearCategory] = useState('');
  const [gearTag, setGearTag] = useState<'vision' | 'cinema' | 'wireless' | 'audio' | 'aerial'>('vision');
  const [gearDesc, setGearDesc] = useState('');

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

  const handlePresetChange = (preset: 'video_edit' | 'broadcast') => {
    setContractTypePreset(preset);
    if (preset === 'video_edit') {
      setContractTitle('CINEMATOGRAPHY & VIDEO PRODUCTION AGREEMENT');
      setContractScope('On-site cinematography, sound capture, lighting execution, and multi-stage post-production editing.');
      setContractDeliverables('4 Fully Edited Videos:\n• Highlight Event Video\n• Interview Session Video\n• Social Media Reel Deliverable\n*Includes up to 2 rounds of minor editorial revisions.');
      setFinalPaymentTrigger('Final 30% balance is due upon presentation of draft preview exports. Final, unwatermarked high-resolution masters and full asset release occur strictly upon confirmation of 100% balance settlement.');
      setContractCustomTerms('• Overtime: On-site coverage exceeding the agreed scope window will be billed at an additional rate of NGN 25,000 per hour (or part thereof).\n• Rescheduling: Date changes requested less than 48 hours prior to call time forfeit the initial commitment deposit and require a new booking fee subject to crew and gear availability.\n• Asset & Media Rights: All raw captured media, working project files, and intellectual property remain the sole property of Tonyshotit Studio until the total project fee is paid in full. Previews are supplied for client approval purposes only.\n• Cancellation: Cancellations inside 48 hours of scheduled call time strictly forfeit the initial commitment deposit to cover equipment holding and crew retainers.');
    } else {
      setContractTitle('LIVE BROADCAST & EVENT PRODUCTION SERVICES AGREEMENT');
      setContractScope('Live multi-camera broadcast engineering, video switching, audio routing, and equipment provision as itemized in the attached invoice.');
      setContractDeliverables('1. Live stream transmission to designated client streaming endpoints\n2. Master program archival recording delivered via Tonyshotit Client Portal\n3. Full-resolution backup media download access');
      setFinalPaymentTrigger('Final 30% balance is strictly due on on-site setup / call day prior to equipment activation or live transmission.');
      setContractCustomTerms('• Overtime: Broadcast operations exceeding scheduled run times are billed at NGN 35,000 per additional hour.\n• Power & Venue: Client guarantees secure overnight hold, stable uninterrupted generator power, and full liability for any physical damage caused by event attendees.\n• Cancellation: Cancellations inside 48 hours of scheduled call time strictly forfeit the initial commitment deposit to cover equipment holding and crew retainers.');
    }
  };

  // --- API FETCHERS ---
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('client_projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProjects(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setInvoices(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchCmsPortfolio = async () => {
    try {
      const { data } = await supabase.from('portfolio_projects').select('*').order('id', { ascending: true });
      if (data) setCmsPortfolioList(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchCmsGear = async () => {
    try {
      const { data } = await supabase.from('gear_items').select('*').order('id', { ascending: true });
      if (data) setCmsGearList(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchCmsTimeline = async () => {
    try {
      const { data } = await supabase.from('experience_timeline').select('*').order('id', { ascending: true });
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
    if (!id || !window.confirm('Delete this client gallery?')) return;
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      const { error } = await supabase.from('client_projects').delete().eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
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
        await supabase.from('client_projects').update(payload).eq('id', editingProjectId);
      } else {
        await supabase.from('client_projects').insert([payload]);
      }
      resetGalleryForm();
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CMS HANDLERS ---
  const handleDirectReelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const cleanFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-videos').upload(cleanFileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('portfolio-videos').getPublicUrl(cleanFileName);
      setPortVideoSrc(publicData.publicUrl);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

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
        await supabase.from('portfolio_projects').update(payload).eq('id', editingPortId);
      } else {
        await supabase.from('portfolio_projects').insert([payload]);
      }
      setEditingPortId(null);
      setPortTitle('');
      setPortVideoSrc('');
      setPortRole('');
      setPortEquipment('');
      setPortDesc('');
      fetchCmsPortfolio();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (id?: number) => {
    if (!id && id !== 0) return;
    if (!window.confirm('Delete this project?')) return;
    setCmsPortfolioList((prev) => prev.filter((p) => p.id !== id));
    await supabase.from('portfolio_projects').delete().eq('id', id);
    fetchCmsPortfolio();
  };

  const handleGearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { name: gearName, category: gearCategory, tag: gearTag, description: gearDesc };
    if (editingGearId) {
      await supabase.from('gear_items').update(payload).eq('id', editingGearId);
    } else {
      await supabase.from('gear_items').insert([payload]);
    }
    setEditingGearId(null);
    setGearName('');
    setGearCategory('');
    setGearDesc('');
    setLoading(false);
    fetchCmsGear();
  };

  const handleDeleteGear = async (id?: number) => {
    if (!id && id !== 0) return;
    if (!window.confirm('Delete gear?')) return;
    setCmsGearList((prev) => prev.filter((g) => g.id !== id));
    await supabase.from('gear_items').delete().eq('id', id);
    fetchCmsGear();
  };

  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { year: expYear, title: expTitle, company: expCompany, responsibilities: expResponsibilities.split('\n').filter(Boolean) };
    if (editingExpId) {
      await supabase.from('experience_timeline').update(payload).eq('id', editingExpId);
    } else {
      await supabase.from('experience_timeline').insert([payload]);
    }
    setEditingExpId(null);
    setExpYear('');
    setExpTitle('');
    setExpCompany('');
    setExpResponsibilities('');
    setLoading(false);
    fetchCmsTimeline();
  };

  const handleDeleteTimeline = async (id?: number) => {
    if (!id && id !== 0) return;
    if (!window.confirm('Delete milestone?')) return;
    setCmsTimelineList((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('experience_timeline').delete().eq('id', id);
    fetchCmsTimeline();
  };

  // --- INVOICE HANDLERS WITH GUARANTEED STATE UPDATES ---
  const resetInvoiceForm = () => {
    setEditingInvoiceId(null);
    setInvNumber(`TS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`);
    setInvClientName('');
    setInvClientEmail('');
    setInvClientAddress('');
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
    setInvExtraFeeLabel('Transportation and Logistics');
    setInvExtraFeeAmount(0);
    setInvItems([{ description: 'On-site location shooting', sub_description: '', quantity: 1, rate: 0 }]);
    setInvNotes('Kindly confirm receipt of this invoice and reach out with any questions regarding pricing, delivery, or payment.');
    setIncludeTerms(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoiceId(String(inv.id));
    setInvNumber(inv.invoice_number || '');
    setInvClientName(inv.client_name || '');
    setInvClientEmail(inv.client_email || '');
    setInvClientAddress(inv.client_address || '');
    setInvProjectFor(inv.project_for || '');
    setInvIssueDate(inv.issue_date || new Date().toISOString().split('T')[0]);
    setInvDueDate(inv.due_date || '');
    setInvCurrency(inv.currency || 'NGN');
    setInvStatus(inv.status || 'Sent');
    setInvBankName(inv.bank_name || 'Moniepoint MFB');
    setInvAccountNumber(inv.account_number || '6478474528');
    setInvAccountName(inv.account_name || 'Tonyshotit Studios - Anthony Ibuzo');
    setInvDiscount(inv.discount || 0);
    setInvTaxPercent(inv.tax_percent || 0);
    setShowVatRow(inv.show_vat_row !== undefined ? inv.show_vat_row : true);
    setInvExtraFeeLabel(inv.extra_fee_label || 'Transportation and Logistics');
    setInvExtraFeeAmount(inv.extra_fee_amount || 0);
    setInvItems(
      inv.items && inv.items.length > 0
        ? inv.items.map((item) => ({
            description: item.description || '',
            sub_description: item.sub_description || '',
            quantity: item.quantity || 1,
            rate: item.rate || 0,
          }))
        : [{ description: '', sub_description: '', quantity: 1, rate: 0 }]
    );
    setInvNotes(inv.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (String(inv.id) === String(invoiceId) ? { ...inv, status: newStatus } : inv))
    );
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
      if (error) throw error;
      setStatusMsg({ type: 'success', text: `Invoice status updated to ${newStatus}` });
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
      fetchInvoices();
    }
  };

  const handleDeleteInvoice = async (id?: string) => {
    if (!id || !window.confirm('Delete invoice?')) return;
    setInvoices((prev) => prev.filter((inv) => String(inv.id) !== String(id)));
    await supabase.from('invoices').delete().eq('id', id);
    if (editingInvoiceId === String(id)) resetInvoiceForm();
    fetchInvoices();
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
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
      discount: invDiscount || 0,
      tax_percent: invTaxPercent || 0,
      show_vat_row: showVatRow,
      extra_fee_label: invExtraFeeLabel || '',
      extra_fee_amount: invExtraFeeAmount || 0,
      items: invItems,
      notes: invNotes,
    };

    if (invClientAddress !== undefined) payload.client_address = invClientAddress;
    if (invAccountName !== undefined) payload.account_name = invAccountName;

    try {
      if (editingInvoiceId) {
        const { error } = await supabase
          .from('invoices')
          .update(payload)
          .eq('id', editingInvoiceId);

        if (error) {
          // If the database complains about missing client_address or account_name columns, strip and retry
          if (error.message.includes('column') || error.code === '42703') {
            delete payload.client_address;
            delete payload.account_name;
            const retry = await supabase.from('invoices').update(payload).eq('id', editingInvoiceId);
            if (retry.error) throw retry.error;
          } else {
            throw error;
          }
        }

        // Optimistically update local state immediately
        setInvoices((prev) =>
          prev.map((inv) =>
            String(inv.id) === String(editingInvoiceId)
              ? { ...inv, ...payload, id: editingInvoiceId }
              : inv
          )
        );

        setStatusMsg({ type: 'success', text: `Invoice ${invNumber} updated successfully!` });
      } else {
        const { data, error } = await supabase.from('invoices').insert([payload]).select();
        if (error) {
          if (error.message.includes('column') || error.code === '42703') {
            delete payload.client_address;
            delete payload.account_name;
            const retry = await supabase.from('invoices').insert([payload]).select();
            if (retry.error) throw retry.error;
            if (retry.data) setInvoices((prev) => [retry.data[0], ...prev]);
          } else {
            throw error;
          }
        } else if (data) {
          setInvoices((prev) => [data[0], ...prev]);
        }

        setStatusMsg({ type: 'success', text: `Invoice ${invNumber} created successfully!` });
      }

      await fetchInvoices();
    } catch (err: any) {
      console.error('Save Error:', err);
      alert(`Save failed: ${err.message}`);
      setStatusMsg({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return { bg: '#14532d', color: '#4ade80', border: '#22c55e' };
      case 'Sent':
        return { bg: '#713f12', color: '#facc15', border: '#eab308' };
      case 'Part Payment':
        return { bg: '#27272a', color: '#ffffff', border: '#e4e4e7' };
      case 'Declined':
        return { bg: '#450a0a', color: '#f87171', border: '#ef4444' };
      case 'Draft':
      default:
        return { bg: '#18181b', color: '#a1a1aa', border: '#52525b' };
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

  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '32px 24px', maxWidth: '400px', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔑</div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>ADMIN STUDIO LOCK</h2>
          <form onSubmit={handleAdminUnlock}>
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="• • • •"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', textAlign: 'center', fontSize: '1.2rem', marginBottom: '16px' }}
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
      
      {/* BULLETPROOF PRINT STYLES - REMOVES THE BLACK BOTTOM BAR AND FORCES COLORS */}
      <style>{`
        @media print {
          /* 1. Only print the white document wrapper and hide all website background elements */
          body * {
            visibility: hidden !important;
          }
          #print-document-wrapper,
          #print-document-wrapper * {
            visibility: visible !important;
          }
          #print-document-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            box-shadow: none !important;
          }

          /* 2. Force browser print engine to preserve colors over Tailwind */
          html, body {
            background-color: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .force-print-green {
            color: #16a34a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .force-print-red {
            color: #dc2626 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .force-print-blue {
            color: #0284c7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .force-print-box {
            background-color: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* HEADER WITH BN & TIN */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>TONYSHOTIT STUDIOS</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '11px', fontWeight: 600 }}>
            MANAGEMENT DASHBOARD • <span style={{ color: '#38bdf8' }}>BN: 9926513</span> • <span style={{ color: '#38bdf8' }}>TIN: 2622415188316</span>
          </p>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>INVOICE & AGREEMENT BUILDER</h2>
                <button 
                  type="button" 
                  onClick={resetInvoiceForm} 
                  style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#222', color: '#38bdf8', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                >
                  + New Blank Invoice
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', maxWidth: '420px' }}>
                <button type="button" onClick={() => setPrintDocumentMode('invoice')} style={{ flex: '1 1 auto', padding: '8px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: printDocumentMode === 'invoice' ? '#fff' : '#222', color: printDocumentMode === 'invoice' ? '#000' : '#888', border: '1px solid #444' }}>
                  👁 Preview Invoice
                </button>
                <button type="button" onClick={() => setPrintDocumentMode('contract')} style={{ flex: '1 1 auto', padding: '8px 12px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: printDocumentMode === 'contract' ? '#38bdf8' : '#222', color: printDocumentMode === 'contract' ? '#000' : '#888', border: '1px solid #444' }}>
                  👁️ Agreement Mode
                </button>
              </div>
            </div>

            {/* INVOICE DETAILS */}
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

            {/* OPTIONAL MULTI-LINE ADDRESS FIELD */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                CLIENT PHYSICAL / BILLING ADDRESS (OPTIONAL - MULTI-LINE)
              </label>
              <textarea 
                rows={2} 
                value={invClientAddress} 
                onChange={(e) => setInvClientAddress(e.target.value)} 
                placeholder="e.g. Km 52, Lekki-Epe Expressway,&#10;Ibeju-Lekki, Lagos, Nigeria&#10;(Leave empty if not required)" 
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px' }} 
              />
            </div>

            {/* CURRENCY, STATUS, BANK, ACCOUNT NUMBER AND ACCOUNT NAME */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
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
                  <option value="Sent">Sent (Pending)</option>
                  <option value="Paid">Paid</option>
                  <option value="Part Payment">Part Payment</option>
                  <option value="Declined">Declined</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>BANK NAME</label>
                <input type="text" value={invBankName} onChange={(e) => setInvBankName(e.target.value)} placeholder="GT Bank" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ACCOUNT NO.</label>
                <input type="text" value={invAccountNumber} onChange={(e) => setInvAccountNumber(e.target.value)} placeholder="0430859996" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>ACCOUNT NAME</label>
                <input type="text" value={invAccountName} onChange={(e) => setInvAccountName(e.target.value)} placeholder="Anthony Ibuzo" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #38bdf8', color: '#fff', borderRadius: '4px', fontWeight: 600 }} />
              </div>
            </div>

            {/* LINE ITEMS */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                SERVICE LINE ITEMS
              </label>
              {invItems.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '6px', border: '1px solid #222', marginBottom: '10px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Line item title (e.g. On-site location shooting)" 
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

            {/* FINANCIALS: DISCOUNT, VAT CHECKBOX & LOGISTICS/DELIVERY LINE */}
            <div style={{ backgroundColor: '#0a0a0a', padding: '16px', borderRadius: '6px', border: '1px solid #222', marginBottom: '20px', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '14px' }}>
                Discounts, VAT Controls & Disbursements
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>DISCOUNT ({currencySymbol.trim()})</label>
                  <input
                    type="number"
                    value={invDiscount === 0 ? '' : invDiscount}
                    onChange={(e) => setInvDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #16a34a', color: '#4ade80', borderRadius: '4px', fontWeight: 'bold' }}
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

              {/* VAT CHECKBOX */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  id="showVatRow"
                  checked={showVatRow}
                  onChange={(e) => setShowVatRow(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="showVatRow" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>
                  Show VAT Row on Invoice (unchecked displays 0.00 Small Business Exemption)
                </label>
              </div>

              {/* DELIVERY / LOGISTICS LINE RIGHT UNDER VAT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>POST-VAT DISBURSEMENT LABEL (e.g. Delivery / Logistics)</label>
                  <input
                    type="text"
                    value={invExtraFeeLabel}
                    onChange={(e) => setInvExtraFeeLabel(e.target.value)}
                    placeholder="Transportation and Logistics"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DISBURSEMENT / DELIVERY AMOUNT ({currencySymbol.trim()})</label>
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

            {/* AGREEMENT SECTION (EXPANDABLE SUBSECTION OF INVOICES) */}
            <div style={{ backgroundColor: '#0c0c0e', border: '1px solid #27272a', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
              <div 
                onClick={() => setShowAgreementEditor(!showAgreementEditor)}
                style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#141417' }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase' }}>
                    📑 Agreement / Contract Editor (Optional Subsection)
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#71717a' }}>
                    Customize legal deliverables, milestones & contract parameters
                  </p>
                </div>
                <button type="button" style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {showAgreementEditor ? '▲ Collapse' : '▼ Expand'}
                </button>
              </div>

              {showAgreementEditor && (
                <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', color: '#aaa', fontWeight: 600 }}>SELECT AGREEMENT TEMPLATE:</label>
                    <select 
                      value={contractTypePreset} 
                      onChange={(e) => handlePresetChange(e.target.value as any)}
                      style={{ padding: '6px 12px', backgroundColor: '#18181b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <option value="video_edit">Cinematography & Video Production Template</option>
                      <option value="broadcast">Live Multi-Camera Broadcast Template</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>AGREEMENT TITLE</label>
                      <input type="text" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DATES & FULFILLMENT WINDOW</label>
                      <input type="text" value={contractFulfillmentWindow} onChange={(e) => setContractFulfillmentWindow(e.target.value)} placeholder="e.g. October 02, 2026 through Conclusion" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>SCOPE OF SERVICE</label>
                    <textarea rows={2} value={contractScope} onChange={(e) => setContractScope(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>KEY DELIVERABLES & HANDOFF</label>
                    <textarea rows={3} value={contractDeliverables} onChange={(e) => setContractDeliverables(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>DEPOSIT COMMITMENT (%)</label>
                      <input type="number" value={depositPercent} onChange={(e) => setDepositPercent(parseFloat(e.target.value) || 0)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>AUTHORIZED CLIENT SIGNER</label>
                      <input type="text" value={contractSignerName} onChange={(e) => setContractSignerName(e.target.value)} placeholder="e.g. GRAVEN MEDIA Representative" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>FINAL BALANCE TRIGGER / TERMS</label>
                    <input type="text" value={finalPaymentTrigger} onChange={(e) => setFinalPaymentTrigger(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>OPERATIONAL TERMS & POLICIES</label>
                    <textarea rows={3} value={contractCustomTerms} onChange={(e) => setContractCustomTerms(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* TERMS & CONDITIONS CHECKBOX & NOTES */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id="includeTerms"
                  checked={includeTerms}
                  onChange={(e) => setIncludeTerms(e.target.checked)}
                  style={{ accentColor: '#38bdf8', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="includeTerms" style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Include Formal Terms & Conditions (Payment Milestones, Revisions, Validity, Asset Ownership) on printed Invoice
                </label>
              </div>
              <textarea
                rows={2}
                value={invNotes}
                onChange={(e) => setInvNotes(e.target.value)}
                placeholder="Notes regarding delivery, wire confirmation..."
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

          {/* VISIBLE DOCUMENT PREVIEW WRAPPER */}
          <div style={{ marginTop: '24px', marginBottom: '36px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
                DOCUMENT PREVIEW: {printDocumentMode === 'invoice' ? 'OFFICIAL INVOICE' : 'PRODUCTION SERVICES AGREEMENT'}
              </h3>
              <span style={{ fontSize: '11px', color: '#888' }}>Live document rendering</span>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '6px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', padding: '4px' }}>
              
              {/* 1. EXACT ORIGINAL INVOICE PREVIEW WITH PRINT ENFORCEMENT */}
              {printDocumentMode === 'invoice' && (
                <div id="print-document-wrapper">
                  <div id="printable-invoice-document" style={{ minWidth: '720px', backgroundColor: '#fff', color: '#000', padding: '50px 44px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
                    
                    {/* Clean Top Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#000', letterSpacing: '-0.5px' }}>INVOICE</h1>
                        <p style={{ margin: '6px 0 2px 0', fontSize: '13px', color: '#222' }}><strong>Invoice No:</strong> {invNumber}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: '#222' }}><strong>Date:</strong> {invIssueDate}</p>
                        {invDueDate && <p className="force-print-red" style={{ margin: '2px 0', fontSize: '13px', color: '#dc2626', fontWeight: 600 }}><strong>Due Date:</strong> {invDueDate}</p>}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: '#000' }}>TONYSHOTIT</h2>
                        <p style={{ margin: '2px 0', fontSize: '11.5px', color: '#444' }}>anthony@tonyshotit.com</p>
                        <p style={{ margin: '2px 0', fontSize: '11.5px', color: '#444' }}>tonyshotit.com</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '11px', color: '#555', margin: '0 0 20px 0', fontStyle: 'italic' }}>
                      Thank you for choosing Tonyshotit Studio - Professional Video & Broadcast Solutions.
                    </p>

                    <hr style={{ border: 'none', borderTop: '2px solid #000', marginBottom: '20px' }} />

                    {/* Two-Column Parties: FROM & BILL TO */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <div className="force-print-box" style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold', margin: '0 0 4px 0' }}>FROM</p>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 2px 0' }}>Tonyshotit Studio</h3>
                        <p style={{ margin: '2px 0', fontSize: '12px' }}>Sales Rep: Anthony Ibuzo</p>
                        <p style={{ margin: '2px 0', fontSize: '12px' }}>anthony@tonyshotit.com</p>
                        <p style={{ margin: '2px 0', fontSize: '12px' }}>tonyshotit.com</p>
                      </div>

                      <div className="force-print-box" style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold', margin: '0 0 4px 0' }}>BILL TO</p>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 2px 0' }}>{invClientName || 'Client Name / Organization'}</h3>
                        {invClientEmail && <p style={{ margin: '2px 0', fontSize: '12px' }}>{invClientEmail}</p>}
                        
                        {invClientAddress && invClientAddress.trim() && (
                          <p style={{ margin: '4px 0 2px 0', fontSize: '11.5px', color: '#4b5563', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                            {invClientAddress.trim()}
                          </p>
                        )}

                        {invProjectFor && <p className="force-print-blue" style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>For: {invProjectFor}</p>}
                      </div>
                    </div>

                    {/* ITEMS TABLE WITH TWO HORIZONTAL HEADER LINES */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                      <thead>
                        <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', color: '#000' }}>
                          <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: '11px', textTransform: 'uppercase', width: '5%', fontWeight: 800 }}>#</th>
                          <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', textTransform: 'uppercase', width: '55%', fontWeight: 800 }}>ITEM DESCRIPTION</th>
                          <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: '11px', textTransform: 'uppercase', width: '8%', fontWeight: 800 }}>QTY</th>
                          <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', textTransform: 'uppercase', width: '16%', fontWeight: 800 }}>UNIT PRICE</th>
                          <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', textTransform: 'uppercase', width: '16%', fontWeight: 800 }}>AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e5e5' }}>
                            <td style={{ textAlign: 'center', padding: '12px 6px', fontSize: '12px', color: '#444' }}>{idx + 1}</td>
                            <td style={{ padding: '12px 10px', fontSize: '12px' }}>
                              <strong style={{ display: 'block', color: '#000' }}>{item.description || 'Service line item'}</strong>
                              {item.sub_description && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', lineHeight: 1.4 }}>{item.sub_description}</div>}
                            </td>
                            <td style={{ textAlign: 'center', padding: '12px 6px', fontSize: '12px' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: '12px' }}>{currencySymbol}{(item.rate || 0).toLocaleString()}</td>
                            <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: '12px', fontWeight: 'bold' }}>{currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Payment Details & Totals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                      
                      {/* Bank & Tax Remittance Details */}
                      <div className="force-print-box" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '14px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#111', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                          PAYMENT & REMITTANCE DETAILS
                        </h4>
                        <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Bank Name:</strong> {invBankName}</p>
                        <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Account Number:</strong> {invAccountNumber}</p>
                        <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Account Name:</strong> {invAccountName}</p>
                        
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #d1d5db' }}>
                          <p style={{ margin: '2px 0', fontSize: '11.5px', color: '#1f2937' }}>
                            <strong>Business Reg (BN):</strong> 9926513
                          </p>
                          <p style={{ margin: '2px 0', fontSize: '11.5px', color: '#1f2937' }}>
                            <strong>Tax ID (TIN):</strong> 2622415188316
                          </p>
                        </div>
                      </div>

                      {/* Totals Breakdown */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                          <span style={{ color: '#555' }}>Subtotal</span>
                          <span style={{ fontWeight: 600 }}>{currencySymbol}{servicesSubtotal.toLocaleString()}</span>
                        </div>

                        {/* DISCOUNT ROW WITH EXPLICIT ENFORCED GREEN PRINT CLASS */}
                        {discountAmount > 0 && (
                          <div className="force-print-green" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #eee', color: '#16a34a', fontWeight: 'bold' }}>
                            <span>Discount Applied</span>
                            <span>- {currencySymbol}{discountAmount.toLocaleString()}</span>
                          </div>
                        )}

                        {showVatRow && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>VAT ({safeTaxPercent}%)</span>
                            <span>{safeTaxPercent > 0 ? `${currencySymbol}${taxAmount.toLocaleString()}` : '0.00 (Small Business Exempt)'}</span>
                          </div>
                        )}

                        {extraFeeAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>{invExtraFeeLabel || 'Transportation and Logistics'}</span>
                            <span style={{ fontWeight: 600 }}>{currencySymbol}{extraFeeAmount.toLocaleString()}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, padding: '10px 0', borderBottom: '2px solid #000' }}>
                          <span>GRAND TOTAL</span>
                          <span>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {invNotes && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold', margin: '0 0 2px 0' }}>NOTES</p>
                        <p style={{ fontSize: '12px', color: '#333', margin: 0, lineHeight: 1.5 }}>{invNotes}</p>
                      </div>
                    )}

                    {/* Terms & Conditions */}
                    {includeTerms && (
                      <div style={{ fontSize: '10px', color: '#555', borderTop: '1px solid #eee', paddingTop: '14px', lineHeight: 1.5 }}>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#222' }}>TERMS & CONDITIONS</p>
                        <p style={{ margin: '0 0 2px 0' }}><strong>Payment Milestones:</strong> An advance commitment deposit is required to confirm booking and mobilize crew/equipment. The remaining balance is strictly due within 24 hours of project completion / final deliverable handoff.</p>
                        <p style={{ margin: '0 0 2px 0' }}><strong>Invoice Validity:</strong> This invoice and reserved equipment/dates remain valid until the specified Due Date. Once the due date has passed, this invoice becomes null and void, subject to schedule availability and price re-evaluation.</p>
                        <p style={{ margin: '0 0 2px 0' }}><strong>Revisions & Scope:</strong> Agreed deliverables include complimentary review cycles. Additional days, overtime hours, or scope modifications outside the agreed line items will be billed separately.</p>
                        <p style={{ margin: '0 0 2px 0' }}><strong>Asset Ownership:</strong> All hardware, broadcast recordings, raw footage, and final video deliverables remain the property of Tonyshotit Studio until the final balance is settled in full.</p>
                        <p style={{ margin: '0 0 2px 0' }}><strong>Cancellation Policy:</strong> Cancellations made within 48 hours of call time forfeit the initial commitment deposit to cover equipment holding and crew retainers.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. EXACT ORIGINAL AGREEMENT PREVIEW */}
              {printDocumentMode === 'contract' && (
                <div id="print-document-wrapper">
                  <div id="printable-contract-document" style={{ minWidth: '720px', backgroundColor: '#fff', color: '#000', padding: '50px 44px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
                    
                    {/* Agreement Header */}
                    <div style={{ marginBottom: '14px' }}>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 6px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '-0.3px' }}>
                        {contractTitle}
                      </h1>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#444' }}>
                        <span>TONYSHOTIT STUDIO • TONYSHOTIT.COM • ANTHONY@TONYSHOTIT.COM</span>
                        <span>Ref: <strong>{invNumber}</strong> • Date: <strong>{invIssueDate}</strong></span>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '2px solid #000', marginBottom: '18px' }} />

                    {/* Intro Clause */}
                    <p style={{ fontSize: '11.5px', lineHeight: 1.5, color: '#222', marginBottom: '16px' }}>
                      This Agreement is entered into as of <strong>{invIssueDate}</strong> by and between <strong>Tonyshotit Studio</strong>, represented by Anthony Ibuzo (the "Producer/Supplier"), and <strong>{invClientName || 'Client'}</strong> ({invClientEmail || 'client email'}) (the "Client").
                    </p>

                    {/* 1. PROJECT SCOPE & DELIVERABLES */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
                        1. PROJECT SCOPE & DELIVERABLES
                      </h3>
                      <p style={{ margin: '0 0 3px 0', fontSize: '11.5px' }}>• <strong>Project / Event:</strong> {invProjectFor || 'Commercial Video Production'}</p>
                      <p style={{ margin: '0 0 3px 0', fontSize: '11.5px' }}>• <strong>Dates & Fulfillment Window:</strong> {contractFulfillmentWindow}</p>
                      <p style={{ margin: '0 0 3px 0', fontSize: '11.5px' }}>• <strong>Scope of Service:</strong> {contractScope}</p>
                      <div style={{ whiteSpace: 'pre-line', fontSize: '11.5px', marginTop: '4px', lineHeight: 1.5 }}>
                        {contractDeliverables}
                      </div>
                    </div>

                    {/* 2. PAYMENT SCHEDULE & MILESTONES TABLE */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
                        2. PAYMENT SCHEDULE & MILESTONES
                      </h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                      <thead>
                        <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', color: '#000' }}>
                          <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10.5px', textTransform: 'uppercase', width: '28%', fontWeight: 800 }}>Milestone</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: '10.5px', textTransform: 'uppercase', width: '22%', fontWeight: 800 }}>Amount Due</th>
                          <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '10.5px', textTransform: 'uppercase', width: '50%', fontWeight: 800 }}>Trigger/Terms</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 'bold' }}>Commitment Deposit ({safeDepositPercent}%)</td>
                          <td style={{ padding: '6px 8px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>{currencySymbol}{depositAmount.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', fontSize: '10.5px' }}>Required upon signing to lock schedule, technical crew, and reserved hardware</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 'bold' }}>Final Balance ({100 - safeDepositPercent}%)</td>
                          <td style={{ padding: '6px 8px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>{currencySymbol}{balanceAmount.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', fontSize: '10.5px' }}>{finalPaymentTrigger}</td>
                        </tr>
                        <tr className="force-print-box" style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #000' }}>
                          <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 'bold' }}>Total Fee (After Discount)</td>
                          <td style={{ padding: '6px 8px', fontSize: '11px', textAlign: 'right', fontWeight: 900 }}>{currencySymbol}{invoiceGrandTotal.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', fontSize: '10.5px' }}>Referenced in Invoice: {invNumber}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p style={{ fontSize: '10.5px', color: '#444', margin: 0 }}>
                      <strong>Settlement Details:</strong> {invBankName} | Account: {invAccountNumber} ({invAccountName}) | BN: 9926513 • TIN: 2622415188316. Late settlements exceeding 5 business days incur a 5% weekly late fee.
                    </p>
                  </div>

                  {/* 3. KEY OPERATIONAL TERMS */}
                  <div style={{ marginBottom: '22px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 6px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
                      3. KEY OPERATIONAL TERMS
                    </h3>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '10.5px', lineHeight: 1.5, color: '#333' }}>
                      {contractCustomTerms}
                    </div>
                  </div>

                  {/* 4. SIGNATURES & ACCEPTANCE */}
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
                      4. SIGNATURES & ACCEPTANCE
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '12px' }}>
                      <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
                        <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 'bold' }}>For Tonyshotit Studio:</p>
                        <p style={{ margin: '14px 0 2px 0', fontSize: '11px' }}>Signature: ______________________________</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Name: Anthony Ibuzo</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Title: Lead Technical Director / Producer</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Date: {invIssueDate}</p>
                      </div>

                      <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
                        <p style={{ margin: '0 0 2px 0', fontSize: '11px', fontWeight: 'bold' }}>For the Client:</p>
                        <p style={{ margin: '14px 0 2px 0', fontSize: '11px' }}>Signature: ______________________________</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Name: {contractSignerName || '________________________'}</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Organization: {invClientName || 'Client'}</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Title: Authorized Representative</p>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Date: ________________________</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SAVED INVOICES RECORDS WITH STATUS BADGES & DROPDOWNS */}
        <div className="no-print" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>SAVED INVOICES ({invoices.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {invoices.map((inv) => {
              const badge = getStatusBadgeStyle(inv.status);
              return (
                <div key={inv.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '12px 14px', borderRadius: '6px', border: '1px solid #222', gap: '10px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>
                        {inv.invoice_number} • {inv.client_name}
                      </h4>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        padding: '2px 7px', 
                        borderRadius: '4px', 
                        backgroundColor: badge.bg, 
                        color: badge.color, 
                        border: `1px solid ${badge.border}`,
                        textTransform: 'uppercase'
                      }}>
                        {inv.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#888' }}>
                      Total: <strong style={{ color: '#fff' }}>{inv.currency || 'NGN'} {(inv.items?.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0) || 0).toLocaleString()}</strong>
                      {inv.project_for && <span> • For: {inv.project_for}</span>}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={inv.status}
                      onChange={(e) => handleQuickStatusChange(String(inv.id), e.target.value as InvoiceStatus)}
                      style={{
                        padding: '5px 8px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Sent" style={{ backgroundColor: '#111', color: '#facc15' }}>🟡 Pending (Sent)</option>
                      <option value="Paid" style={{ backgroundColor: '#111', color: '#4ade80' }}>🟢 Paid</option>
                      <option value="Part Payment" style={{ backgroundColor: '#111', color: '#ffffff' }}>⚪ Part Payment</option>
                      <option value="Declined" style={{ backgroundColor: '#111', color: '#f87171' }}>🔴 Declined</option>
                      <option value="Draft" style={{ backgroundColor: '#111', color: '#a1a1aa' }}>🔘 Draft</option>
                    </select>

                    <button type="button" onClick={() => handleEditInvoice(inv)} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>Edit</button>
                    <button type="button" onClick={() => handleDeleteInvoice(inv.id)} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              );
            })}
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
                <input type="text" required value={portVideoSrc} onChange={(e) => setPortVideoSrc(e.target.value)} placeholder="https://..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }} />
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
                <label htmlFor="verticalCheck" style={{ fontSize: '12px', color: '#ccc', cursor: 'pointer' }}>Vertical Video (9:16)</label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {loading ? 'SAVING...' : editingPortId ? 'UPDATE PROJECT' : 'ADD TO PORTFOLIO'}
                </button>
                {editingPortId && (
                  <button type="button" onClick={() => setEditingPortId(null)} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
                    <button type="button" onClick={() => {
                      setEditingPortId(item.id || null);
                      setPortTitle(item.title);
                      setPortCategory(item.category);
                      setPortVideoSrc(item.video_src);
                      setPortRole(item.role);
                      setPortEquipment(Array.isArray(item.equipment) ? item.equipment.join(', ') : '');
                      setPortDesc(item.description);
                      setPortIsVertical(item.is_vertical);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button type="button" onClick={() => handleDeletePortfolio(Number(item.id))} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cmsSubTab === 'gear' && (
          <div>
            <form onSubmit={handleGearSubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>{editingGearId ? 'EDIT GEAR ITEM' : 'ADD NEW GEAR ITEM'}</h2>
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
                <textarea rows={2} required value={gearDesc} onChange={(e) => setGearDesc(e.target.value)} placeholder="Technical specs..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {loading ? 'SAVING...' : editingGearId ? 'UPDATE GEAR' : 'ADD TO ARSENAL'}
                </button>
                {editingGearId && (
                  <button type="button" onClick={() => setEditingGearId(null)} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
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
                    <button type="button" onClick={() => {
                      setEditingGearId(g.id || null);
                      setGearName(g.name);
                      setGearCategory(g.category);
                      setGearTag(g.tag);
                      setGearDesc(g.description);
                    }} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button type="button" onClick={() => handleDeleteGear(Number(g.id))} style={{ padding: '6px 12px', backgroundColor: '#300', color: '#f88', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cmsSubTab === 'timeline' && (
          <div>
            <form onSubmit={handleTimelineSubmit} style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#38bdf8' }}>{editingExpId ? 'EDIT EXPERIENCE MILESTONE' : 'ADD NEW MILESTONE'}</h2>
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
                <textarea rows={3} required value={expResponsibilities} onChange={(e) => setExpResponsibilities(e.target.value)} placeholder="Managed 6 camera feeds..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {loading ? 'SAVING...' : editingExpId ? 'UPDATE MILESTONE' : 'ADD MILESTONE'}
                </button>
                {editingExpId && (
                  <button type="button" onClick={() => setEditingExpId(null)} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
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
                    <button type="button" onClick={() => {
                      setEditingExpId(t.id || null);
                      setExpYear(t.year);
                      setExpTitle(t.title);
                      setExpCompany(t.company);
                      setExpResponsibilities(Array.isArray(t.responsibilities) ? t.responsibilities.join('\n') : '');
                    }} style={{ padding: '6px 12px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
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
                <input type="text" placeholder="Title" value={vid.title} onChange={(e) => { const updated = [...videos]; updated[idx].title = e.target.value; setVideos(updated); }} style={{ flex: '1 1 140px', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                <input type="text" placeholder="Direct Video URL" value={vid.url} onChange={(e) => { const updated = [...videos]; updated[idx].url = e.target.value; setVideos(updated); }} style={{ flex: '2 1 200px', boxSizing: 'border-box', padding: '8px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                {videos.length > 1 && (
                  <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== idx))} style={{ padding: '8px 12px', backgroundColor: '#300', color: '#f88', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>FULL RESOLUTION DOWNLOAD LINK</label>
            <input type="text" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>DIRECTOR NOTES</label>
            <textarea rows={3} value={directorNotes} onChange={(e) => setDirectorNotes(e.target.value)} placeholder="Notes..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, minWidth: '160px', padding: '12px', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'SAVING...' : editingProjectId ? 'UPDATE GALLERY LINK' : 'PUBLISH CLIENT GALLERY'}
            </button>
            {editingProjectId && (
              <button type="button" onClick={resetGalleryForm} style={{ padding: '12px 18px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
            )}
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.map((proj) => (
            <div key={proj.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: '6px', border: '1px solid #222', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff' }}>{proj.client_name} - {proj.project_title}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Slug: <code style={{ color: '#38bdf8' }}>/client/{proj.slug}</code> | PIN: <strong style={{ color: '#fff' }}>{proj.pin}</strong></p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <a href={`/client/${proj.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 10px', backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '4px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>View ↗</a>
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