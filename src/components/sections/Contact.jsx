import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { MapPin, Phone, Mail, Send, Check } from 'lucide-react';

// --- AMPLIFY GEN 2 INTEGRATION ---
// import { generateClient } from 'aws-amplify/data';
// Note: On n'initialise plus le client ici pour éviter l'erreur de configuration "hoisting"

// Composants
import Section from '../ui/Section';
import Button from '../ui/Button';

// Utilitaires
import { isValidEmail, isValidHaitianPhone } from '../../utils/helpers';

const ContactInfo = ({ icon: Icon, title, content, link, linkType }) => {
  let linkProps = {};

  if (link) {
    switch (linkType) {
      case 'phone':
        linkProps.href = `tel:${link}`;
        break;
      case 'email':
        linkProps.href = `mailto:${link}`;
        break;
      case 'map':
        linkProps.href = link;
        linkProps.target = '_blank';
        linkProps.rel = 'noopener noreferrer';
        break;
      default:
        linkProps.href = link;
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="bg-primary/10 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        {link ? (
          <a
            {...linkProps}
            className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            {content}
          </a>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{content}</p>
        )}
      </div>
    </div>
  );
};

ContactInfo.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  link: PropTypes.string,
  linkType: PropTypes.oneOf(['phone', 'email', 'map'])
};

const Contact = () => {
  // Initialisation du client API à l'intérieur du composant pour garantir qu'Amplify est configuré
  // const client = generateClient();

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // État des erreurs du formulaire
  const [formErrors, setFormErrors] = useState({});

  // État de soumission du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mettre à jour les données du formulaire
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Supprimer l'erreur correspondante si le champ est modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};

    // Valider le nom
    if (!formData.name.trim()) {
      errors.name = "Veuillez entrer votre nom";
    }

    // Valider l'email
    if (!formData.email.trim()) {
      errors.email = "Veuillez entrer votre email";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Veuillez entrer un email valide";
    }

    // Valider le numéro de téléphone (si renseigné)
    if (formData.phone && !isValidHaitianPhone(formData.phone)) {
      errors.phone = "Veuillez entrer un numéro de téléphone haïtien valide";
    }

    // Valider le message
    if (!formData.message.trim()) {
      errors.message = "Veuillez entrer votre message";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Votre message doit contenir au moins 10 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider le formulaire
    if (!validateForm()) return;

    // Indiquer que le formulaire est en train d'être soumis
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // TODO: IMPLEMENT NEW BACKEND SUBMISSION HERE
      // The previous Amplify Gen 2 implementation has been removed.

      console.log("Form submitted locally:", formData);

      // Simulate network delay for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      /*
      // --- OLD AMPLIFY CALL (REMOVED) ---
      const { data, errors } = await client.mutations.envoyerContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      if (errors) ...
      if (data && !data.success) ...
      */

      // Succès
      setIsSubmitted(true);

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      // Gérer l'erreur
      console.error('Erreur lors de l\'envoi du message:', error);
      setSubmitError(error.message || "Une erreur s'est produite. Veuillez réessayer plus tard.");
    } finally {
      // Terminer la soumission
      setIsSubmitting(false);
    }
  };

  // Informations de contact
  const contactInfo = [
    {
      icon: MapPin,
      title: "Notre Adresse",
      content: "Génipailler, 3e Section Milot",
      link: "https://maps.google.com/?q=Genipailler,Milot,Haiti",
      linkType: "map"
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+509 41 70 4234",
      link: "+50941704234",
      linkType: "phone"
    },
    {
      icon: Mail,
      title: "Email",
      content: "mainoffice@limajs.com",
      link: "mainoffice@limajs.com",
      linkType: "email"
    }
  ];

  return (
    <Section
      id="contact"
      title="Entrer en Contact"
      subtitle="Nous sommes là pour répondre à vos questions et vous aider dans vos déplacements."
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      <div className="grid md:grid-cols-2 gap-12">
        {/* Informations de contact */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {contactInfo.map((info) => (
            <ContactInfo
              key={info.title}
              icon={info.icon}
              title={info.title}
              content={info.content}
              link={info.link}
              linkType={info.linkType}
            />
          ))}

          {/* Carte Google Maps intégrée */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 aspect-video bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30106.80393651724!2d-72.22648968700048!3d19.606071042656377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb1f0262e1bb5eb%3A0xae7549560a3dc5a6!2sMilot!5e0!3m2!1sfr!2sht!4v1708864584371!5m2!1sfr!2sht"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Carte LIMAJS MOTORS"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </motion.div>

        {/* Formulaire de contact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-6">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Message envoyé avec succès!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
              >
                Envoyer un autre message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Envoyez-nous un message</h3>

              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.message}</p>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                icon={Send}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Heures d'ouverture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-16 bg-primary/5 dark:bg-primary/10 rounded-xl p-8 max-w-5xl mx-auto"
      >
        <h3 className="text-xl font-bold mb-6 text-center">Heures d&apos;ouverture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-2">Bureaux administratifs</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex justify-between">
                <span>Lundi - Vendredi:</span>
                <span>8h00 - 17h00</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi:</span>
                <span>8h00 - 12h00</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche:</span>
                <span>Fermé</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-2">Service de transport</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex justify-between">
                <span>Lundi - Vendredi:</span>
                <span>6h00 - 19h00</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi:</span>
                <span>6h00 - 18h00</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche:</span>
                <span>8h00 - 16h00</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-2">Service client</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex justify-between">
                <span>Lundi - Vendredi:</span>
                <span>7h30 - 18h00</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi:</span>
                <span>8h00 - 16h00</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche:</span>
                <span>Urgence uniquement</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </Section>
  );
};

export default Contact;