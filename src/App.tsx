import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductionTiers from './components/ProductionTiers';
import Portfolio from './components/Portfolio';
import Timeline from './components/Timeline';
import GearKit from './components/GearKit';
import Socials from './components/Socials';
import Footer from './components/Footer';
import AboutMe from './components/AboutMe';
import ClientPortal from './components/ClientPortal';
import BookingDrawer from './components/BookingDrawer';
import NotFound from './components/NotFound';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<string | undefined>(undefined);

  const openBookingWithService = (service?: string) => {
    setSelectedBookingService(service);
    setIsBookingOpen(true);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-black flex flex-col justify-between">
        <Header onOpenBooking={() => openBookingWithService()} />
        
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={
              <>
                <Hero onOpenBooking={() => openBookingWithService()} />
                <ProductionTiers onSelectTier={(service) => openBookingWithService(service)} />
                <AboutMe />
              </>
            } />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/experience" element={<Timeline />} />
            <Route path="/gear" element={<GearKit />} />
            <Route path="/socials" element={<Socials />} />
            <Route path="/client/:slug" element={<ClientPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <BookingDrawer
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialService={selectedBookingService}
        />
      </div>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;