import { useState } from 'react';

/**
 * Hook personnalisé pour gérer l'envoi d'emails via l'API backend
 * @returns {Object} - Méthodes et états pour gérer l'envoi d'emails
 */
export function useEmailService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Envoie un email via l'API backend
   * @param {Object} formData - Données du formulaire (name, email, phone, message)
   * @param {boolean} sendConfirmation - Envoyer un email de confirmation à l'utilisateur
   * @returns {Promise} - Promesse résolue avec les données de réponse ou rejetée avec une erreur
   */
  const sendEmail = async (formData, sendConfirmation = false) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Envoyer le message principal
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de l\'envoi du message');
      }
      
      // Envoyer l'email de confirmation si demandé
      if (sendConfirmation) {
        await fetch('/api/email/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });
      }
      
      setSuccess(true);
      return data;
    } catch (err) {
      console.error('Erreur d\'envoi d\'email:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Teste la configuration SMTP
   * @returns {Promise<Object>} - Résultat du test
   */
  const testEmailConfig = async () => {
    try {
      const response = await fetch('/api/email/test');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Échec du test de configuration email');
      }
      
      return data;
    } catch (err) {
      console.error('Erreur de test email:', err);
      throw err;
    }
  };

  return {
    sendEmail,
    testEmailConfig,
    loading,
    error,
    success,
    // Pour réinitialiser les états si nécessaire
    resetStates: () => {
      setLoading(false);
      setError(null);
      setSuccess(false);
    }
  };
}

export default useEmailService;