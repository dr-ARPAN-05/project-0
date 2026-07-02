import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Story from '../components/Story.jsx';
import Pillars from '../components/Pillars.jsx';
import Network from '../components/Network.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <Hero />
      <Story />
      <Pillars />
      <Network />
      <Footer />
    </div>
  );
}
