// src/components/sections/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Shield } from 'lucide-react';
import PropTypes from 'prop-types';

// Composants
import Section from '../ui/Section';
import Counter from '../ui/Counter';
import Button from '../ui/Button';
import Timeline from '../ui/Timeline';

const StatItem = ({ icon: Icon, value, label }) => (
  <div className="flex flex-col items-center p-6 text-center">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <Counter
      end={parseInt(value)}
      suffix={value.includes('+') ? '+' : ''}
      
      valueClassName="text-3xl font-bold mb-2"
      label={label}
      duration={2.5}
    />
  </div>
);

StatItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};



const About = () => {
  // Histoire de l'entreprise pour la timeline
  const historyItems = [
    {
      date: "Septembre 2021",
      title: "Création de LIMAJS MOTORS SA",
      description: "LIMAJS MOTORS SA voit le jour. Le nom est un acronyme qui réunit les noms/prénoms des initiateurs du projet: Lina Joseph Charles, Michel Jacky, Antenor Wilner, Janvier Noldey Jean Sonold et Sandro Serges Louis.",
      icon: Users
    },
    {
      date: "Octobre 2021",
      title: "Acquisition des premiers véhicules",
      description: "Début des opérations avec une flotte initiale de bus modernes et confortables."
    },
    {
      date: "Janvier 2022",
      title: "Lancement des services d'abonnement",
      description: "Introduction des formules d'abonnement pour les trajets réguliers."
    },
    {
      date: "Avril 2022",
      title: "Intégration de la technologie NFC",
      description: "Déploiement du système de paiement sans contact par carte NFC."
    }
  ];

  return (
    <Section 
      id="about" 
      title="À Propos de LIMAJS MOTORS" 
      subtitle="Notre mission est de révolutionner le transport en commun dans le Nord d'Haïti."
    >
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        {/* Texte À Propos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-6 text-primary">Notre Vision</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Nous sommes dédiés à révolutionner le transport en commun dans le Nord d&apos;Haïti. 
            Notre vision est de créer un réseau de transport moderne, fiable et accessible à tous.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            En mettant l&apos;accent sur l&apos;innovation, le confort et la ponctualité, nous nous 
            engageons à améliorer la mobilité urbaine et à faciliter les déplacements quotidiens de nos passagers.
          </p>
          <h3 className="text-2xl font-bold mb-4 text-primary">Notre Mission</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            LIMAJS MOTORS SA vise à connecter les gens et les communautés par le transport. Elle se donne pour mission 
            de favoriser la mobilité durable des écoliers, des universitaires et des professionnels par des systèmes 
            de transport sécuritaires et accessibles. Ses actions se fondent d&apos;une part, sur l&apos;excellence, une façon 
            d&apos;offrir continuellement un service de qualité optimale, rigoureux et respectueux qui valorise les parties 
            prenantes et qui s&apos;inspire des meilleurs pratiques des systèmes de transports internationaux. D&apos;autres part, 
            sur le réseautage, une façon d&apos;assurer la bonne liaison entre les acteurs du service tant local que régional, 
            tant national qu&apos;international. Et enfin, la multiplication, une façon d&apos;assurer la durabilité du service 
            dans le temps et dans l&apos;espace et garantir un effort de partenariat à l&apos;échelle mondiale. D&apos;où notre slogan : 
            L&apos;accès et l&apos;assurance de voyager !
          </p>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/a-propos/histoire'}
          >
            Découvrir notre histoire
          </Button>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-6"
        >
          <StatItem 
            icon={MapPin} 
            value="10+" 
            label="Itinéraires" 
          />
          <StatItem 
            icon={Users} 
            value="1000+" 
            label="Passagers" 
          />
          <StatItem 
            icon={Clock} 
            value="99%" 
            label="Ponctualité" 
          />
          <StatItem 
            icon={Shield} 
            value="100%" 
            label="Sécurité" 
          />
        </motion.div>
      </div>



      {/* Histoire de l'entreprise */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Notre Histoire
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez les moments clés qui ont façonné LIMAJS MOTORS depuis sa création.
          </p>
        </motion.div>

        <Timeline items={historyItems} align="alternate" />
      </div>

      {/* Impact Social */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Notre Impact Social
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            LIMAJS MOTORS SA contribue au développement économique et social du Nord d&apos;Haïti.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            {
              title: "11+",
              description: "Emplois créés dès la première année"
            },
            {
              title: "Mobilité",
              description: "Amélioration de la mobilité urbaine"
            },
            {
              title: "Solutions",
              description: "Aux problèmes de transport quotidien"
            },
            {
              title: "Écologie",
              description: "Technologie écoénergétique et durable"
            }
          ].map((impact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm"
            >
              <h4 className="text-xl font-bold text-primary mb-2">{impact.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{impact.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            variant="primary"
            onClick={() => window.location.href = '/a-propos/impact-social'}
          >
            Découvrir notre impact
          </Button>
        </div>
      </motion.div>

      {/* L'équipe - Aperçu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 text-center"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Notre Équipe
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          L&apos;entreprise est dirigée par un conseil d&apos;administration (CA) qui est responsable de son contrôle et de sa gestion. Les membres ont des compétences diverses en gestion de projet, NTIC, recherche opérationnelle, et plus.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/a-propos/equipe'}
        >
          Rencontrer notre équipe
        </Button>
      </motion.div>
    </Section>
  );
};

export default About;