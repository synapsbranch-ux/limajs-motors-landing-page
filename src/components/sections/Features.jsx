// src/components/sections/Features.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, CheckCircle, Clock, ShieldCheck, Truck, Users, Headphones } from 'lucide-react';
import PropTypes from 'prop-types';

// Composants
import Section from '../ui/Section';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
  >
    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

const Features = () => {
  // Fonctionnalités de la carte de transport
  const cardFeatures = [
    {
      icon: CreditCard,
      title: "Inscription facile",
      description: "Inscrivez-vous rapidement grâce à une interface utilisateur intuitive."
    },
    {
      icon: Smartphone,
      title: "Rechargement des cartes",
      description: "Rechargez vos cartes de transport facilement via l'application."
    },
    {
      icon: CheckCircle,
      title: "Validation des trajets",
      description: "Validez vos trajets en un geste avec la technologie NFC."
    },
    {
      icon: Clock,
      title: "Gestion des transactions",
      description: "Suivez et gérez toutes vos transactions en temps réel."
    }
  ];

  // Avantages compétitifs
  const advantages = [
    {
      icon: ShieldCheck,
      title: "Sécurité maximale",
      description: "Tous nos véhicules sont régulièrement inspectés et nos chauffeurs formés aux normes de sécurité."
    },
    {
      icon: Truck,
      title: "Flotte moderne",
      description: "Des véhicules récents et bien entretenus pour un confort optimal lors de vos déplacements."
    },
    {
      icon: Users,
      title: "Service inclusif",
      description: "Nous nous engageons à rendre nos services accessibles à tous les membres de la communauté."
    },
    {
      icon: Headphones,
      title: "Support client 24/7",
      description: "Notre équipe est disponible à tout moment pour répondre à vos questions et résoudre vos problèmes."
    }
  ];

  return (
    <Section 
      id="features" 
      title="Fonctionnalités" 
      subtitle="Découvrez les fonctionnalités innovantes qui rendent vos déplacements plus simples et plus efficaces."
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      {/* Fonctionnalités de la carte */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Carte de Transport Intelligente
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Notre système de carte NFC révolutionne vos déplacements au quotidien.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cardFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Image ou illustration de la carte */}
      <div className="mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
          <div className="aspect-video bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-44 bg-gradient-to-r from-primary to-secondary rounded-lg relative overflow-hidden">
                <div className="absolute top-4 left-4 text-white font-bold">
                  LIMAJS MOTORS
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-xs opacity-80">Titulaire</div>
                  <div className="font-medium">NOM UTILISATEUR</div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 text-center">
            <h4 className="text-lg font-semibold mb-2">Carte de Transport NFC</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Accédez à tous nos services avec une seule carte. Rechargez-la, suivez votre historique et gérez vos abonnements.
            </p>
          </div>
        </div>
      </div>

      {/* Avantages compétitifs */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Nos Avantages
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ce qui nous différencie des autres services de transport.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={advantage.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <FeatureCard {...advantage} />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Features;