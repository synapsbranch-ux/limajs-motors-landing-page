// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';

// Context
import { useAppContext } from '../../context/AppContext';

// Components
import Navigation from './Navigation';
import LogoImage from '../../assets/images/logo/logo.png';

const Header = () => {
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    isHeaderCompact, 
    isDarkMode, 
    toggleDarkMode 
  } = useAppContext();

  // Menu déployé pour le mobile
  const mobileMenuVariants = {
    closed: {
      x: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Animation du header au scroll
  const headerVariants = {
    expanded: {
      height: "5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
    },
    compact: {
      height: "4rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
    },
  };

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    return () => {
      closeMobileMenu();
    };
  }, [closeMobileMenu]);

  return (
    <motion.header
      variants={headerVariants}
      initial="expanded"
      animate={isHeaderCompact ? "compact" : "expanded"}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full backdrop-blur-md dark:bg-gray-900/90"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <img src={LogoImage} alt="LIMAJS MOTORS" className="h-10 md:h-12 w-auto" />
            <span className="ml-2 font-bold text-lg md:text-xl text-primary hidden sm:inline-block">
              LIMAJS MOTORS
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:block">
            <nav className="flex items-center space-x-1">
              <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Accueil
              </Link>
              <Link to="/services" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Services
              </Link>
              <Link to="/a-propos" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                À propos
              </Link>
              <Link to="/investir" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Investir
              </Link>
              <Link to="/rapport-activite" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Rapport d'activité
              </Link>
              <Link to="/contact" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                Contact
              </Link>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Bouton thème */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>

            {/* Bouton Login */}
            <Link
              to="https://limajs.com/api/passenger/login/"
              target="_blank"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <span>Login</span>
            </Link>

            {/* Bouton menu mobile */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 md:hidden"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-0 z-50 md:hidden bg-white dark:bg-gray-900"
          >
            <div className="container mx-auto px-4 py-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                  <img src={LogoImage} alt="LIMAJS MOTORS" className="h-10 w-auto" />
                  <span className="ml-2 font-bold text-xl text-primary">
                    LIMAJS MOTORS
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2"
                  aria-label="Fermer le menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation mobile */}
              <div className="flex-grow flex flex-col">
                <Link 
                  to="/" 
                  className="py-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={closeMobileMenu}
                >
                  Accueil
                </Link>
                <Link 
                  to="/services" 
                  className="py-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={closeMobileMenu}
                >
                  Services
                </Link>
                <Link 
                  to="/a-propos" 
                  className="py-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={closeMobileMenu}
                >
                  À propos
                </Link>
                <Link 
                  to="/investir" 
                  className="py-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={closeMobileMenu}
                >
                  Investir
                </Link>
                <Link 
                  to="/rapport-activite" 
                  className="py-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={closeMobileMenu}
                >
                  Rapport d'activité
                </Link>
                <Link 
                  to="/contact" 
                  className="py-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </div>

              {/* Actions en bas du menu mobile */}
              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
                <Link
                  to="https://limajs.com/api/passenger/login/"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  onClick={closeMobileMenu}
                >
                  <span>Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;