// src/utils/helpers.js

/**
 * Utilitaires généraux pour le site LIMAJS MOTORS
 */

// Format les numéros de téléphone pour l'affichage
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Nettoyer le numéro de tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format pour les numéros haïtiens
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    
    return phoneNumber; // Retourne le format original si inconnu
  };
  
  // Validation d'email simple
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validation de numéro de téléphone haïtien
  export const isValidHaitianPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Formats valides: 8 chiffres (local) ou +509 suivi de 8 chiffres
    return (cleaned.length === 8) || 
           (cleaned.length === 11 && cleaned.startsWith('509')) ||
           (cleaned.length === 12 && cleaned.startsWith('5099'));
  };
  
  // Formatage de date
  export const formatDate = (date, locale = 'fr-FR') => {
    if (!date) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString(locale, options);
  };
  
  // Format monétaire pour les montants en Gourdes
  export const formatCurrency = (amount, currency = 'HTG') => {
    if (amount === undefined || amount === null) return '';
    
    // Formater le montant avec séparateur de milliers
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
    
    return formattedAmount;
  };
  
  // Tronque le texte à une longueur maximale
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    
    return text.slice(0, maxLength).trim() + '...';
  };
  
  // Génère un slug à partir d'un texte (pour les URLs)
  export const slugify = (text) => {
    if (!text) return '';
    
    return text
      .toString()
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/[^\w-]+/g, '') // Supprime les caractères non alphanumériques
      .replace(/--+/g, '-'); // Remplace les tirets multiples par un seul
  };
  
  // Détermine si l'appareil est mobile
  export const isMobile = () => {
    return window.innerWidth < 768;
  };
  
  // Défile vers un élément spécifique avec une animation fluide
  export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };
  
  // Obtient la date actuelle au format YYYY-MM-DD
  export const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // Génère un ID unique
  export const generateId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Calcule le temps de lecture d'un article
  export const calculateReadingTime = (text, wordsPerMinute = 200) => {
    if (!text) return 0;
    
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    
    return minutes;
  };