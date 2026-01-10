// src/components/sections/Partners.jsx
import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Composants
import Section from '../ui/Section';

// Import de l'image collage des partenaires
import PartnersCollageImage from '../../assets/images/partners/professional-img.png';

const PartnerLogo = ({ name, image }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center justify-center"
  >
    <img 
      src={image} 
      alt={name} 
      className="max-h-16 w-auto grayscale hover:grayscale-0 transition-all duration-300"
    />
  </motion.div>
);

PartnerLogo.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired
};

const PartnerCard = ({ name, type, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
  >
    <h3 className="font-semibold text-lg text-primary mb-2">
      {name}
    </h3>
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
      {type}
    </div>
    {description && (
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {description}
      </p>
    )}
  </motion.div>
);

PartnerCard.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  description: PropTypes.string
};

const Partners = () => {
  // Liste des partenaires
  const partners = [
    { 
      name: 'BUSKO', 
      type: 'Partenaire technologique',
      description: 'Solutions technologiques pour le transport public'
    },
    { 
      name: 'ISTEAH', 
      type: 'Partenaire académique',
      description: 'Institut des Sciences, des Technologies et des Études Avancées d\'Haïti'
    },
    { 
      name: 'GRAHN', 
      type: 'Partenaire stratégique',
      description: 'Groupe de Réflexion et d\'Action pour une Haïti Nouvelle'
    },
    { 
      name: 'PIGraN', 
      type: 'Partenaire d\'innovation',
      description: 'Pôle d\'Innovation du Grand Nord'
    }
  ];

  // Animation pour révéler les éléments
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Section 
      id="partners" 
      title="Nos Partenaires" 
      subtitle="Nous collaborons avec des institutions de confiance pour vous offrir le meilleur service possible."
      bgColor="bg-white dark:bg-gray-900"
    >
      {/* Image collage des partenaires */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-16"
      >
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img 
            src={PartnersCollageImage} 
            alt="Nos partenaires" 
            className="w-full h-auto"
          />
          {/* Overlay subtil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      </motion.div>

      {/* Liste des partenaires */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {partners.map((partner) => (
          <motion.div
            key={partner.name}
            variants={itemVariants}
          >
            <PartnerCard 
              name={partner.name}
              type={partner.type}
              description={partner.description}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Citation */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center p-8 bg-primary/5 dark:bg-primary/10 rounded-lg max-w-3xl mx-auto"
      >
        <blockquote>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic mb-4">
            &quot;Ensemble, nous construisons l&apos;avenir du transport en Haïti&quot;
          </p>
          <footer className="text-gray-600 dark:text-gray-400">
            — La vision partagée de nos partenariats
          </footer>
        </blockquote>
      </motion.div>

      {/* Information supplémentaire */}
      <div className="mt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">
            Intéressé à devenir partenaire?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            Nous sommes toujours à la recherche de nouveaux partenariats pour améliorer nos services 
            et contribuer au développement du transport en Haïti.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Contactez-nous
          </motion.a>
        </motion.div>
      </div>
    </Section>
  );
};

export default Partners;