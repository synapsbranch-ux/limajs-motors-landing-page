// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';

// Assets
import LogoImage from '../../assets/images/logo/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Animation pour les liens
  const linkAnimation = {
    rest: { x: 0 },
    hover: { x: 5, transition: { duration: 0.3 } }
  };
  
  // Animation pour les icônes sociales
  const socialAnimation = {
    rest: { scale: 1 },
    hover: { scale: 1.2, transition: { duration: 0.3 } }
  };
  
  // Liens de navigation rapide
  const quickLinks = [
    { label: 'Accueil', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'À propos', to: '/a-propos' },
    { label: 'Investir', to: '/investir' },
    { label: 'Partenaires', to: '/partenaires' },
    { label: 'Contact', to: '/contact' },
  ];
  
  // Liens des services
  const serviceLinks = [
    { label: 'Transport Urbain', to: '/services/transport-urbain' },
    { label: 'Abonnements', to: '/services/abonnements' },
    { label: 'Location de Véhicules', to: '/services/location' },
    { label: 'Livraison et Coursier', to: '/services/livraison' },
  ];
  
  // Réseaux sociaux
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/limajsmotors' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/limajsmotors' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/company/limajsmotors' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Colonne 1: À propos */}
          <div>
            <div className="flex items-center mb-6">
              <img 
                src={LogoImage} 
                alt="LIMAJS MOTORS" 
                className="h-12 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-white">LIMAJS MOTORS</span>
            </div>
            <p className="text-gray-400 mb-6">
              Votre service de transport en commun moderne et fiable en Haïti.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-primary transition-colors"
                  aria-label={social.label}
                  initial="rest"
                  whileHover="hover"
                  variants={socialAnimation}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Colonne 2: Liens rapides */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Liens Rapides</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    variants={linkAnimation}
                  >
                    <Link 
                      to={link.to} 
                      className="text-gray-400 hover:text-primary transition-colors flex items-center"
                    >
                      <ArrowRight size={14} className="mr-2" />
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3: Nos services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Nos Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <motion.div
                    initial="rest"
                    whileHover="hover"
                    variants={linkAnimation}
                  >
                    <Link 
                      to={link.to} 
                      className="text-gray-400 hover:text-primary transition-colors flex items-center"
                    >
                      <ArrowRight size={14} className="mr-2" />
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4: Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-3 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Génipailler, 3e Section Milot</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-3 text-primary flex-shrink-0" />
                <a 
                  href="tel:+50941704234" 
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  +509 41 70 4234
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-3 text-primary flex-shrink-0" />
                <a 
                  href="mailto:mainoffice@limajs.com" 
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  mainoffice@limajs.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-8 border-t border-gray-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p>
              &copy; {currentYear} LIMAJS MOTORS S.A. Tous droits réservés.
            </p>
            <div className="mt-4 sm:mt-0">
              <Link to="/confidentialite" className="text-gray-400 hover:text-primary transition-colors mr-4">
                Confidentialité
              </Link>
              <Link to="/conditions" className="text-gray-400 hover:text-primary transition-colors">
                Conditions d&apos;utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;