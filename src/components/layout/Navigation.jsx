// src/components/layout/Navigation.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Home, Bus, Info, CreditCard, Phone, User } from 'lucide-react';

// Composant de lien de navigation avec sous-menu
const NavItem = ({ item, isMobile, closeMobileMenu }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const location = useLocation();
  
  // Vérifier si le lien actuel ou un de ses sous-liens est actif
  const isActive = location.pathname === item.to || 
    (item.submenu && item.submenu.some(subitem => location.pathname === subitem.to));
  
  // Animations pour le sous-menu
  const submenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Si pas de sous-menu, retourner un lien simple
  if (!item.submenu) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) => 
          `flex items-center gap-2 py-2 px-4 rounded-lg transition-colors
          ${isMobile 
            ? 'text-lg mb-2' 
            : 'text-base'} 
          ${isActive 
            ? 'text-primary font-medium' 
            : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary'}`
        }
        onClick={closeMobileMenu}
      >
        {item.icon && <item.icon size={isMobile ? 22 : 18} />}
        <span>{item.label}</span>
      </NavLink>
    );
  }

  // Avec sous-menu
  return (
    <div className={`relative ${isMobile ? 'mb-2' : ''}`}>
      <button
        className={`flex items-center justify-between gap-2 py-2 px-4 rounded-lg w-full transition-colors
          ${isMobile ? 'text-lg' : 'text-base'} 
          ${isActive 
            ? 'text-primary font-medium' 
            : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary'}`
        }
        onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
        aria-expanded={isSubmenuOpen}
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon size={isMobile ? 22 : 18} />}
          <span>{item.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Sous-menu */}
      <AnimatePresence>
        {isSubmenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={submenuVariants}
            className={`overflow-hidden ${isMobile 
              ? 'pl-10 mt-1 mb-2' 
              : 'absolute left-0 top-full min-w-[200px] bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 mt-1 z-20'}`
            }
          >
            {item.submenu.map((subitem) => (
              <NavLink
                key={subitem.to}
                to={subitem.to}
                className={({ isActive }) => 
                  `block py-2 px-4 rounded-lg transition-colors
                  ${isMobile ? 'text-base' : 'text-sm'} 
                  ${isActive 
                    ? 'text-primary font-medium' 
                    : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary'}`
                }
                onClick={closeMobileMenu}
              >
                {subitem.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

NavItem.propTypes = {
  item: PropTypes.shape({
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    submenu: PropTypes.arrayOf(PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })),
  }).isRequired,
  isMobile: PropTypes.bool,
  closeMobileMenu: PropTypes.func,
};

// Composant principal
const Navigation = ({ isMobile = false, closeMobileMenu = () => {} }) => {
  // Définition des liens de navigation avec leurs sous-menus
  const navItems = [
    {
      to: '/',
      label: 'Accueil',
      icon: Home,
    },
    {
      to: '/services',
      label: 'Services',
      icon: Bus,
      submenu: [
        { to: '/services/transport-urbain', label: 'Transport Urbain' },
        { to: '/services/abonnements', label: 'Abonnements' },
        { to: '/services/location', label: 'Location' },
        { to: '/services/livraison', label: 'Livraison' },
      ],
    },
    {
      to: '/a-propos',
      label: 'À propos',
      icon: Info,
      submenu: [
        { to: '/a-propos/histoire', label: 'Notre Histoire' },
        { to: '/a-propos/equipe', label: 'Notre Équipe' },
        { to: '/a-propos/impact-social', label: 'Impact Social' },
      ],
    },
    {
      to: '/investir',
      label: 'Investir',
      icon: CreditCard,
      submenu: [
        { to: '/investir/marche', label: 'Analyse du Marché' },
        { to: '/investir/actions', label: 'Actions' },
        { to: '/investir/avantages', label: 'Avantages Concurrentiels' },
      ],
    },
    {
      to: '/contact',
      label: 'Contact',
      icon: Phone,
    },
  ];

  return (
    <nav className={isMobile ? 'space-y-1' : 'flex items-center space-x-1'}>
      {navItems.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          isMobile={isMobile}
          closeMobileMenu={closeMobileMenu}
        />
      ))}
    </nav>
  );
};

Navigation.propTypes = {
  isMobile: PropTypes.bool,
  closeMobileMenu: PropTypes.func,
};

export default Navigation;