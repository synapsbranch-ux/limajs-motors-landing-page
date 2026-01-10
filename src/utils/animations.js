// src/utils/animations.js
import { cubicBezier } from "framer-motion";

// Courbes d'accélération personnalisées
export const easing = {
  smooth: cubicBezier(0.4, 0, 0.2, 1),
  springy: cubicBezier(0.34, 1.56, 0.64, 1),
  soft: cubicBezier(0.4, 0.0, 0.2, 1),
};

// Animation d'apparition au scroll
export const fadeInUp = {
  initial: {
    y: 60,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing.smooth,
    },
  },
};

// Animation de fondu
export const fadeIn = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing.soft,
    },
  },
};

// Animation pour le menu mobile
export const mobileMenu = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    },
  },
  closed: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easing.smooth,
    },
  },
};

// Animation pour les cartes
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: easing.smooth,
    },
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      duration: 0.2,
      ease: easing.springy,
    },
  },
};

// Animation pour le Hero Section
export const heroAnimation = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: easing.springy,
    },
  },
};

// Animation pour le carrousel
export const slideAnimation = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// Animation pour les sections de contenu
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// Animation pour le loader
export const loaderVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Animation pour les boutons
export const buttonTap = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Animation pour le texte
export const textReveal = {
  initial: {
    y: "100%",
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: easing.smooth,
    },
  },
};

// Animation pour les images
export const imageReveal = {
  initial: {
    scale: 1.2,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: easing.soft,
    },
  },
};

// Animation pour le scroll parallax
export const parallaxScroll = (yOffset = 100) => ({
  initial: {
    y: 0,
  },
  animate: {
    y: yOffset,
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 20,
      ease: "linear",
    },
  },
});

// Animation pour les notifications
export const notificationToast = {
  initial: { x: 300, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    }
  },
  exit: { 
    x: 300, 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    }
  },
};

// Gestionnaire d'animation pour le scroll
export const scrollReveal = {
  hidden: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.6,
      ease: easing.smooth,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easing.smooth,
    },
  },
};

// Configuration pour l'intersection observer
export const observerConfig = {
  threshold: 0.1,
  triggerOnce: true,
};

// Exemple d'utilisation dans un composant:
/*
import { motion } from 'framer-motion';
import { fadeInUp, observerConfig } from '../utils/animations';

const MyComponent = () => {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={observerConfig}
      variants={fadeInUp}
    >
      Contenu animé
    </motion.div>
  );
};
*/