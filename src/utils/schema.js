/**
 * Données structurées schema.org pour le SEO
 * À inclure dans la balise <head> du site
 */

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "LIMAJS MOTORS SA",
    "image": "https://www.limajsmotorssaht.com/assets/images/logo/logo.png",
    "logo": "https://www.limajsmotorssaht.com/assets/images/logo/logo.png",
    "description": "Service de transport en commun moderne, fiable et confortable au Cap-Haïtien.",
    "url": "https://www.limajsmotorssaht.com/",
    "telephone": "+50941704234",
    "email": "mainoffice@limajs.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Génipailler, 3e Section",
      "addressLocality": "Milot",
      "addressRegion": "Nord",
      "addressCountry": "Haïti"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.6074",
      "longitude": "-72.2125"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
      ],
      "opens": "06:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://facebook.com/limajsmotors",
      "https://instagram.com/limajsmotors",
      "https://linkedin.com/company/limajsmotors"
    ]
  };
  
  export const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Transport en commun",
    "provider": {
      "@type": "LocalBusiness",
      "name": "LIMAJS MOTORS SA"
    },
    "areaServed": {
      "@type": "City",
      "name": "Cap-Haïtien"
    },
    "description": "Service de transport urbain et interurbain dans le Nord d'Haïti",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "HTG",
      "availability": "https://schema.org/InStock"
    }
  };
  
  // Aide à insérer le schema dans une page
  export const getSchemaJsonLd = (schema) => {
    return {
      __html: JSON.stringify(schema)
    };
  };
  
  // Utilisation dans une page:
  // <script 
  //   type="application/ld+json"
  //   dangerouslySetInnerHTML={getSchemaJsonLd(organizationSchema)} 
  // />