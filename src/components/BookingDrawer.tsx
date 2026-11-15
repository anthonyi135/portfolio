import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  Film,
  Compass,
  Layers,
  Calendar,
  MapPin,
  Send,
  CheckCircle2,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

const WEB3FORMS_ACCESS_KEY = 'ee7b9d7e-5d1c-481b-9bec-acd42959854f';

const SERVICE_OPTIONS = [
  {
    id: 'Live Multi-Camera Broadcast',
    label: 'Live Multi-Cam Broadcast',
    sub: 'Conferences, convocations, concerts & live streaming',
    icon: Radio,
    accent: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  },
  {
    id: 'Commercial Video & Editing',
    label: 'Cinematography & Editing',
    sub: 'Brand films, documentaries, interviews & social reels',
    icon: Film,
    accent: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  },
  {
    id: 'Aerial Drone Coverage',
    label: 'Aerial Drone Operation',
    sub: '4K aerial cinematography, campus/venue sweeps & FPV',
    icon: Compass,
    accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  },
  {
    id: 'Hybrid Broadcast + Post-Production',
    label: 'Full Hybrid Production',
    sub: 'Simultaneous live broadcast + post-event highlight film',
    icon: Layers,
    accent: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
  },
];

const BookingDrawer: React.FC<BookingDrawerProps> = ({ isOpen, onClose, initialService }) => {
  const [mounted, setMounted] = useState(false);
  const [serviceType, setServiceType] = useState(SERVICE_OPTIONS[0].id);
  const [clientName, setClientName] = useState('');
  const [organization, setOrganization] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialService) {
      setServiceType(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Save lead to Supabase Admin Dashboard
      await supabase.from('booking_inquiries').insert([
        {
          client_name: clientName,
          organization,
          client_email: clientEmail,
          client_phone: clientPhone,
          service_type: serviceType,
          event_date: eventDate,
          location,
          project_details: projectDetails,
        },
      ]);

      // 2. Fire instant email alert via Web3Forms
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New Production Inquiry: ${serviceType} — ${organization || clientName}`,
          from_name: 'Tonyshotit Studios Booking Desk',
          name: clientName,
          email: clientEmail,
          organization: organization || 'N/A',
          phone: clientPhone || 'N/A',
          service_scope: serviceType,
          target_date: eventDate || 'TBD',
          venue_location: location || 'Lagos',
          project_brief: projectDetails,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setClientName('');
    setOrganization('');
    setClientEmail('');
    setClientPhone('');
    setEventDate('');
    setLocation('');
    setProjectDetails('');
    onClose();
  };

  const buildMailtoLink = () => {
    const subject = encodeURIComponent(`Production Inquiry: ${serviceType} — ${organization || clientName || 'New Project'}`);
    const body = encodeURIComponent(
      `Hello Tonyshotit Studios,\n\n` +
      `I would like to request a production quote:\n` +
      `• Name: ${clientName}\n` +
      `• Organization: ${organization || 'N/A'}\n` +
      `• Service: ${serviceType}\n` +
      `• Target Date: ${eventDate || 'TBD'}\n` +
      `• Venue / Location: ${location || 'Lagos'}\n` +
      `• Phone: ${clientPhone || 'N/A'}\n\n` +
      `Project Brief:\n${projectDetails || 'Please share availability and rate card.'}`
    );
    return `mailto:anthony@tonyshotit.com?subject=${subject}&body=${body}`;
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex justify-end"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#09090b] border-l border-zinc-800/90 h-full overflow-y-auto p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-zinc-900">
                <div>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-[0.25em] text-sky-400 mb-1.5">
                    TONYSHOTIT STUDIOS • BOOKING DESK
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Request Production Quote
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetAndClose}
                  aria-label="Close booking drawer"
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-14 text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Brief Received</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-semibold">{clientName}</span>. Your{' '}
                    <span className="text-sky-400 font-semibold">{serviceType}</span> inquiry has been dispatched directly to Anthony Ibuzo. You will receive a formal availability & rate response within 24 hours.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={buildMailtoLink()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-200"
                    >
                      <Mail className="w-4 h-4 text-sky-400" />
                      Also Send Copy via Email
                    </a>
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200"
                    >
                      Return to Studio
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="py-6 space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                      1. Select Production Scope
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SERVICE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = serviceType === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setServiceType(option.id)}
                            className={`text-left p-3.5 rounded-xl border transition-all duration-200 ${
                              selected
                                ? 'bg-zinc-900 border-sky-500 shadow-lg shadow-sky-500/10'
                                : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`p-1.5 rounded-md border ${option.accent}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-bold text-white">{option.label}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-snug">{option.sub}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      2. Client / Organization Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Your Full Name *"
                        className="w-full px-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white placeholder-zinc-600"
                      />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Company / Institution"
                        className="w-full px-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white placeholder-zinc-600"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Work Email Address *"
                        className="w-full px-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white placeholder-zinc-600"
                      />
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Phone / WhatsApp Number"
                        className="w-full px-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      3. Schedule & Venue
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Venue / Area (e.g. Victoria Island)"
                          className="w-full pl-10 pr-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white placeholder-zinc-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                      4. Project Brief & Deliverables
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={projectDetails}
                      onChange={(e) => setProjectDetails(e.target.value)}
                      placeholder="Describe camera count, streaming destinations, event duration, or deliverables needed..."
                      className="w-full px-3.5 py-3 rounded-lg bg-black border border-zinc-800 focus:border-sky-500 focus:outline-none text-sm text-white placeholder-zinc-600 resize-none"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Submitting Inquiry...' : 'Submit Production Inquiry'}
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <span>Prefer direct email?</span>
                      <a
                        href={buildMailtoLink()}
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Open in Mail App ↗
                      </a>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>TONYSHOTIT STUDIOS • RC 9926513</span>
              <span>LAGOS, NIGERIA</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BookingDrawer;