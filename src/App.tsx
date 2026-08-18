import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Timeline from './components/Timeline';
import GearKit from './components/GearKit';
import Footer from './components/Footer';
import AboutMe from './components/AboutMe';
import { Admin } from './components/Admin';
import ClientPortal from './components/ClientPortal';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black flex flex-col justify-between">
        <Header />
        
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <AboutMe />
              </>
            } />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/experience" element={<Timeline />} />
            <Route path="/gear" element={<GearKit />} />
            
            {/* New Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/client/:slug" element={<ClientPortal />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
