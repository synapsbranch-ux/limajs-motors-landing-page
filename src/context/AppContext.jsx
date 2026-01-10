// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte
const AppContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => useContext(AppContext);

// Fournisseur du contexte
export const AppProvider = ({ children }) => {
  // État pour le thème (clair/sombre)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // État pour la langue (français par défaut, préparation pour créole et anglais)
  const [language, setLanguage] = useState('fr');
  
  // État pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // État pour suivre le scroll
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // État pour l'en-tête réduit après défilement
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  
  // Gestionnaire de défilement
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsHeaderCompact(position > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Détection des préférences de thème système
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
    
    // Appliquer le mode sombre au document si nécessaire
    if (prefersDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Écouteur pour les changements de préférences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Fonction pour basculer le mode sombre manuellement
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  };
  
  // Fonction pour changer la langue
  const changeLanguage = (lang) => {
    if (['fr', 'ht', 'en'].includes(lang)) {
      setLanguage(lang);
      // Ici, vous pourriez également sauvegarder la préférence dans localStorage
      localStorage.setItem('limajs-language', lang);
    }
  };
  
  // Fonction pour ouvrir/fermer le menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    // Bloquer le défilement du corps lorsque le menu est ouvert
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  // Fonction pour fermer le menu mobile
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };
  
  // Récupérer les traductions en fonction de la langue
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    // Chargement conditionnel des traductions
    const loadTranslations = async () => {
      try {
        // Dans un projet réel, vous importeriez les traductions ici
        // Exemple simple pour la démo
        const translations = {
          fr: {
            home: 'Accueil',
            services: 'Services',
            about: 'À propos',
            invest: 'Investir',
            contact: 'Contact',
            // Autres traductions...
          },
          ht: {
            home: 'Akèy',
            services: 'Sèvis',
            about: 'Apropo',
            invest: 'Envesti',
            contact: 'Kontakte',
            // Autres traductions...
          },
          en: {
            home: 'Home',
            services: 'Services',
            about: 'About',
            invest: 'Invest',
            contact: 'Contact',
            // Autres traductions...
          }
        };
        
        setTranslations(translations[language] || translations.fr);
      } catch (error) {
        console.error('Erreur lors du chargement des traductions:', error);
      }
    };
    
    loadTranslations();
  }, [language]);
  
  // Fonction pour traduire une clé
  const t = (key) => {
    return translations[key] || key;
  };
  
  // Valeurs du contexte à exposer
  const contextValue = {
    isDarkMode,
    toggleDarkMode,
    language,
    changeLanguage,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    scrollPosition,
    isHeaderCompact,
    t,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Exemple d'utilisation:
 * 
 * import { useAppContext } from '../context/AppContext';
 * 
 * const Component = () => {
 *   const { isDarkMode, toggleDarkMode, t } = useAppContext();
 *   
 *   return (
 *     <div>
 *       <button onClick={toggleDarkMode}>
 *         {isDarkMode ? 'Mode clair' : 'Mode sombre'}
 *       </button>
 *       <h1>{t('home')}</h1>
 *     </div>
 *   );
 * };
 */