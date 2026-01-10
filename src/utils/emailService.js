// src/utils/emailService.js
// This file handles contact form submission via AWS Amplify Lambda function
// The actual email sending is done server-side by the Lambda function

/**
 * Valide les données du formulaire de contact
 * @param {Object} data - Données du formulaire
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateContactData = (data) => {
  const errors = {};

  // Validation du nom
  if (!data.name || !data.name.trim()) {
    errors.name = 'Le nom est requis';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères';
  }

  // Validation de l'email
  if (!data.email || !data.email.trim()) {
    errors.email = 'L\'email est requis';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Format d\'email invalide';
    }
  }

  // Validation du téléphone (optionnel)
  if (data.phone && data.phone.trim()) {
    const haitianPhoneRegex = /^(\+509|509)?[\s-]?([234789]\d{7})$/;
    const cleanPhone = data.phone.replace(/[\s-]/g, '');
    if (!haitianPhoneRegex.test(cleanPhone)) {
      errors.phone = 'Format de numéro haïtien invalide (+509 XX XX XXXX)';
    }
  }

  // Validation du message
  if (!data.message || !data.message.trim()) {
    errors.message = 'Le message est requis';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères';
  } else if (data.message.trim().length > 1000) {
    errors.message = 'Le message ne peut pas dépasser 1000 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formate un numéro de téléphone haïtien
 * @param {string} phone - Numéro brut
 * @returns {string} - Numéro formaté
 */
export const formatHaitianPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('509')) {
    const number = cleaned.substring(3);
    return `+509 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4)}`;
  } else if (cleaned.length === 8) {
    return `+509 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4)}`;
  }
  
  return phone;
};

/**
 * Échappe les caractères HTML
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Envoie un email de contact via la Lambda function AWS Amplify
 * @param {Object} contactData - Données du contact
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendContactEmail = async (contactData) => {
  try {
    // Valider les données
    const validation = validateContactData(contactData);
    if (!validation.isValid) {
      throw new Error('Données invalides: ' + Object.values(validation.errors).join(', '));
    }

    // TODO: Appeler la Lambda function via AWS Amplify
    // Option 1: Via une mutation GraphQL (si configurée)
    // Option 2: Via une API REST Amplify
    // Option 3: Via l'invocation directe de la fonction
    
    // Exemple temporaire - à remplacer par l'appel Amplify réel
    console.log('📧 Envoi du message de contact via Amplify Lambda:', contactData);
    
    // PLACEHOLDER: Remplacer ceci par le vrai appel Amplify
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: contactData.name.trim(),
        email: contactData.email.trim(),
        phone: contactData.phone?.trim() || null,
        message: contactData.message.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du message');
    }

    const result = await response.json();

    return {
      success: true,
      message: 'Message envoyé avec succès',
      data: result,
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error);
    
    throw new Error(
      error.message || 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
    );
  }
};

/**
 * Vérifie la configuration du service de contact
 * @returns {Object} - État de la configuration
 */
export const checkContactConfig = () => {
  // TODO: Vérifier que l'API Amplify est configurée
  return {
    isConfigured: true, // À remplacer par une vraie vérification
    message: 'Configuration via AWS Amplify Lambda',
  };
};

// Utilitaires supplémentaires
export const emailUtils = {
  formatHaitianPhone,
  escapeHtml,
  
  /**
   * Limite le nombre de tentatives par session
   */
  rateLimiter: (() => {
    const attempts = new Map();
    const LIMIT = 5; // 5 tentatives
    const WINDOW = 15 * 60 * 1000; // 15 minutes

    return {
      canSend: (identifier = 'default') => {
        const now = Date.now();
        const userAttempts = attempts.get(identifier) || [];
        
        // Nettoyer les anciennes tentatives
        const recentAttempts = userAttempts.filter(time => now - time < WINDOW);
        attempts.set(identifier, recentAttempts);
        
        return recentAttempts.length < LIMIT;
      },
      
      recordAttempt: (identifier = 'default') => {
        const userAttempts = attempts.get(identifier) || [];
        userAttempts.push(Date.now());
        attempts.set(identifier, userAttempts);
      },
      
      getRemainingTime: (identifier = 'default') => {
        const userAttempts = attempts.get(identifier) || [];
        if (userAttempts.length === 0) return 0;
        
        const oldestAttempt = Math.min(...userAttempts);
        const timeLeft = WINDOW - (Date.now() - oldestAttempt);
        
        return Math.max(0, Math.ceil(timeLeft / 1000 / 60)); // en minutes
      }
    };
  })()
};

export default {
  sendContactEmail,
  validateContactData,
  checkContactConfig,
  emailUtils
};