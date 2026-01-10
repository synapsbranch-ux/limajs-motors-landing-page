// src/components/ui/Carousel.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({
  images,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
  height = 'aspect-video',
  overlay = false,
  borderRadius = 'rounded-xl',
  infinite = true,
  pauseOnHover = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlayInterval || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [images.length, autoPlayInterval, isPaused]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    if (!infinite && 
       ((currentIndex === 0 && newDirection === -1) || 
        (currentIndex === images.length - 1 && newDirection === 1))) {
      return;
    }
    
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + newDirection;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
  };

  // Aucune image à afficher
  if (!images || images.length === 0) {
    return null;
  }

  // Une seule image : affichage statique
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden ${height} ${borderRadius} ${className}`}>
        <img
          src={images[0]}
          alt="Carousel image"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {overlay && (
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${borderRadius} ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div className={`${height} relative`}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
            alt={`Slide ${currentIndex + 1}`}
          />
        </AnimatePresence>

        {overlay && (
          <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"></div>
        )}
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-gray-800 hover:bg-white dark:bg-black/30 dark:text-white dark:hover:bg-black/50 transition-colors z-10"
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            disabled={!infinite && currentIndex === 0}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-gray-800 hover:bg-white dark:bg-black/30 dark:text-white dark:hover:bg-black/50 transition-colors z-10"
            onClick={() => paginate(1)}
            aria-label="Next slide"
            disabled={!infinite && currentIndex === images.length - 1}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 
                ${index === currentIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Carousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  autoPlayInterval: PropTypes.number,
  showArrows: PropTypes.bool,
  showDots: PropTypes.bool,
  className: PropTypes.string,
  height: PropTypes.string,
  overlay: PropTypes.bool,
  borderRadius: PropTypes.string,
  infinite: PropTypes.bool,
  pauseOnHover: PropTypes.bool
};

export default Carousel;