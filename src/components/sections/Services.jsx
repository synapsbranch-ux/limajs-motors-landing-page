// src/components/sections/Services.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Bus, GraduationCap, Briefcase, Users, Calendar, Car, Package, Clock, ShieldCheck, DollarSign, Zap } from 'lucide-react';

// Composants
import Section from '../ui/Section';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Assets
import TransportPublicImage from '../../assets/images/tech/transport-public.jpg';
import TransportServiceImage from '../../assets/images/tech/transport-service.jpg';

const ServiceCard = ({ title, description, icon: Icon, image, onClick }) => (
  <Card
    image={image}
    icon={Icon}
    title={title}
    subtitle={description}
    hoverable
    onClick={onClick}
    className="group hover:scale-105 transition-transform duration-300"
  />
);

ServiceCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  image: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

const FeatureCard = ({ label, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
  >
    <h3 className="font-bold text-lg mb-2 text-primary">
      {label}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </motion.div>
);

FeatureCard.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

const Services = () => {
  // Clientèles cibles
  const clientServices = [
    {
      title: "Écoliers",
      description: "Des trajets sécurisés et confortables pour vos petits, chaque jour.",
      icon: Bus,
      image: TransportPublicImage,
      link: "/services/transport-urbain?client=ecoliers"
    },
    {
      title: "Étudiants",
      description: "Arrivez à l'heure à vos cours avec notre service de transport rapide et abordable.",
      icon: GraduationCap,
      image: TransportServiceImage,
      link: "/services/transport-urbain?client=etudiants"
    },
    {
      title: "Employés",
      description: "Commencez votre journée de travail sans tracas grâce à notre service de transport efficace.",
      icon: Briefcase,
      image: TransportPublicImage,
      link: "/services/transport-urbain?client=employes"
    },
    {
      title: "Grand public",
      description: "Déplacez-vous facilement à travers la ville à un prix abordable.",
      icon: Users,
      image: TransportServiceImage,
      link: "/services/transport-urbain?client=public"
    }
  ];

  // Types de services
  const serviceTypes = [
    {
      title: "Transport Urbain",
      description: "Un service régulier et ponctuel à travers Cap-Haïtien et ses environs.",
      icon: Bus,
      link: "/services/transport-urbain"
    },
    {
      title: "Abonnements",
      description: "Économisez avec nos formules d'abonnement adaptées à vos besoins.",
      icon: Calendar,
      link: "/services/abonnements"
    },
    {
      title: "Location",
      description: "Besoin d'un véhicule pour vos déplacements personnels? Découvrez notre flotte.",
      icon: Car,
      link: "/services/location"
    },
    {
      title: "Livraison",
      description: "Nous transportons vos colis avec une fiabilité exemplaire.",
      icon: Package,
      link: "/services/livraison"
    }
  ];

  // Caractéristiques des services
  const features = [
    { 
      label: "Fiabilité", 
      description: "Horaires précis et trajets optimisés",
      icon: Clock
    },
    { 
      label: "Sécurité", 
      description: "Véhicules entretenus et chauffeurs formés",
      icon: ShieldCheck
    },
    { 
      label: "Accessibilité", 
      description: "Tarifs abordables et paiement flexible",
      icon: DollarSign
    },
    { 
      label: "Innovation", 
      description: "Paiement sans contact par carte NFC",
      icon: Zap
    }
  ];

  // Navigation vers une page de service
  const navigateToService = (link) => {
    window.location.href = link;
  };

  return (
    <Section 
      id="services" 
      title="Nos Services" 
      subtitle="Découvrez nos solutions de transport adaptées à vos besoins quotidiens."
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      {/* Types de services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {serviceTypes.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1
            }}
          >
            <Card
              title={service.title}
              subtitle={service.description}
              icon={service.icon}
              hoverable
              variant="filled"
              onClick={() => navigateToService(service.link)}
              footer={
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToService(service.link);
                  }}
                >
                  En savoir plus
                </Button>
              }
            />
          </motion.div>
        ))}
      </div>

      {/* Transport Urbain et Interurbain - Section détaillée */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Transport Urbain et Interurbain
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Un service régulier et ponctuel à travers Cap-Haïtien et ses environs pour tous types de clientèle.
          </p>
        </motion.div>

        {/* Clientèles cibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <ServiceCard 
                title={service.title}
                description={service.description}
                icon={service.icon}
                image={service.image}
                onClick={() => navigateToService(service.link)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Caractéristiques des services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.1
            }}
          >
            <FeatureCard 
              label={feature.label}
              description={feature.description}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 text-center"
      >
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigateToService('/contact')}
        >
          Réserver un service
        </Button>
      </motion.div>
    </Section>
  );
};

export default Services;