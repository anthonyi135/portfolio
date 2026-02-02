import Header from './components/Header';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Timeline from './components/Timeline';
import GearKit from './components/GearKit';
import Footer from './components/Footer';
import AboutMe from './components/AboutMe';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <AboutMe />
      <Portfolio />
      <div id="experience">
        <Timeline />
      </div>
      <div id="gear">
        <GearKit />
      </div>
      <Footer />
    </div>
  );
}

export default App;
