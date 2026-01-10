// src/utils/seo.js
import { organizationSchema, serviceSchema } from './schema';

/**
 * Métadonnées SEO pour les pages principales
 * À utiliser avec React Helmet ou React Helmet Async
 */

// Métadonnées de base qui s'appliquent à tout le site
export const defaultSeoData = {
  title: "LIMAJS MOTORS SA | Votre transport en bus moderne à Cap-Haïtien",
  description: "LIMAJS MOTORS offre un service de transport en commun fiable et confortable au Cap-Haïtien. Transport urbain et interurbain, services d'abonnement, location de véhicules.",
  keywords: "transport Cap-Haïtien, bus Haïti, transport en commun Nord Haïti, LIMAJS MOTORS, location véhicule Haïti",
  canonical: "https://www.limajsmotorssaht.com/",
  locale: "fr_FR",
  ogType: "website",
  twitterCard: "summary_large_image",
  ogImage: "https://www.limajsmotorssaht.com/images/og-image.jpg", // 1200x630px recommandé
  twitterImage: "https://www.limajsmotors.com/images/twitter-image.jpg", // 1200x600px recommandé
  siteUrl: "https://www.limajsmotors.com",
};

// Métadonnées pour la page d'accueil
export const homeSeoData = {
  ...defaultSeoData,
  schema: organizationSchema,
};

// Métadonnées pour la page Services
export const servicesSeoData = {
  ...defaultSeoData,
  title: "Nos Services de Transport | LIMAJS MOTORS",
  description: "Découvrez nos services de transport urbain, location de véhicules, abonnements et livraison au Cap-Haïtien. LIMAJS MOTORS, votre partenaire de mobilité.",
  keywords: "transport urbain Cap-Haïtien, abonnement bus Haïti, location véhicule Cap-Haïtien, livraison colis Nord Haïti",
  canonical: "https://www.limajsmotors.com/services",
  schema: serviceSchema,
};

// Métadonnées pour la page À Propos
export const aboutSeoData = {
  ...defaultSeoData,
  title: "À Propos de LIMAJS MOTORS | Notre Histoire et Équipe",
  description: "Découvrez l'histoire et la mission de LIMAJS MOTORS, entreprise de transport fondée en 2021 au Cap-Haïtien. Notre équipe et notre impact social en Haïti.",
  keywords: "transport Cap-Haïtien histoire, équipe LIMAJS MOTORS, impact social transport Haïti, LIMAJS MOTORS fondation",
  canonical: "https://www.limajsmotors.com/a-propos",
};

// Métadonnées pour la page Investir
export const investSeoData = {
  ...defaultSeoData,
  title: "Opportunités d'Investissement | LIMAJS MOTORS",
  description: "Investissez dans LIMAJS MOTORS, opportunité dans le secteur du transport au Nord d'Haïti. Analyse du marché, types d'actions et avantages concurrentiels.",
  keywords: "investir transport Haïti, actions LIMAJS MOTORS, marché transport Cap-Haïtien, investissement transport Haïti",
  canonical: "https://www.limajsmotors.com/investir",
};

// Métadonnées pour la page Partenaires
export const partnersSeoData = {
  ...defaultSeoData,
  title: "Nos Partenaires | LIMAJS MOTORS",
  description: "Découvrez les partenaires de LIMAJS MOTORS qui nous aident à révolutionner le transport en commun dans le Nord d'Haïti. Collaborations stratégiques et institutionnelles.",
  keywords: "partenaires LIMAJS MOTORS, BUSKO, ISTEAH, GRAHN, PIGraN, partenariat transport Haïti",
  canonical: "https://www.limajsmotors.com/partenaires",
};

// Métadonnées pour la page Contact
export const contactSeoData = {
  ...defaultSeoData,
  title: "Contactez LIMAJS MOTORS | Transport Cap-Haïtien",
  description: "Contactez LIMAJS MOTORS pour vos besoins de transport au Cap-Haïtien. Formulaire de contact, adresse, téléphone et email pour toutes vos questions.",
  keywords: "contact LIMAJS MOTORS, téléphone transport Cap-Haïtien, adresse bus Haïti, email LIMAJS MOTORS",
  canonical: "https://www.limajsmotors.com/contact",
};

/**
 * Fonction pour générer les balises meta pour une page spécifique
 * @param {Object} seoData - Données SEO pour la page
 * @returns {Object} - Objet contenant toutes les balises meta
 */
export const generateSeoTags = (seoData) => {
  const { title, description, keywords, canonical, locale, ogType, ogImage, twitterCard, twitterImage, siteUrl, schema } = seoData;
  
  return {
    title: title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: ogImage },
      { property: 'og:locale', content: locale },
      { property: 'og:site_name', content: 'LIMAJS MOTORS' },
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: twitterImage },
      { name: 'robots', content: 'index, follow' },
    ],
    link: [
      { rel: 'canonical', href: canonical }
    ],
    schema: schema,
  };
};

