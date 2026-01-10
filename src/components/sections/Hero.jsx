// src/components/sections/Hero.jsx
import React from 'react';
import Carousel from '../ui/Carousel';

// Assets
import CitadelleImage from '../../assets/images/hero/citadelle.jpg';
import PalaisImage from '../../assets/images/hero/palais-sanssouci.jpeg';
import PlaceArmesImage from '../../assets/images/hero/place-armes.webp';
import CapPanoramaImage from '../../assets/images/hero/cap-haitien.webp';

const Hero = () => {
  // Images pour le carousel
  const heroImages = [
    CitadelleImage,
    PalaisImage,
    PlaceArmesImage,
    CapPanoramaImage
  ];

  return (
    <section className="relative min-h-screen">
      {/* Carousel en arrière-plan */}
      <div className="absolute inset-0 z-0">
        <Carousel 
          images={heroImages}
          autoPlayInterval={6000}
          className="w-full h-full"
          height="h-full"
          overlay={true}
          showDots={false}
          showArrows={false}
        />
        {/* Overlay gradient si nécessaire */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />
      </div>
    </section>
  );
};

export default Hero;
