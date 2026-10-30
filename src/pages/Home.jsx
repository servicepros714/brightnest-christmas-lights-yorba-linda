import Hero from '../sections/Hero.jsx';
import Packages from '../sections/Packages.jsx';
import Gallery from '../sections/Gallery.jsx';
import HowItWorks from '../sections/HowItWorks.jsx';
import SeasonTimeline from '../sections/SeasonTimeline.jsx';
import Faq from '../sections/Faq.jsx';
import ServiceArea from '../sections/ServiceArea.jsx';
import Reviews from '../sections/Reviews.jsx';
import FinalCta from '../sections/FinalCta.jsx';
import { useReveal } from '../components/useReveal.js';

export default function Home() {
  useReveal();
  return (
    <main>
      <Hero />
      <Packages />
      <Gallery />
      <HowItWorks />
      <SeasonTimeline />
      <Faq />
      <ServiceArea />
      <Reviews />
      <FinalCta />
    </main>
  );
}
