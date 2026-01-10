// src/components/sections/Vision.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Compass, Target, Star, TrendingUp, Lightbulb, Globe, CircleDollarSign, Heart } from 'lucide-react';

// Composants
import Section from '../ui/Section';
import Button from '../ui/Button';

const VisionCard = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col"
    >
      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 flex-grow">{description}</p>
    </motion.div>
  );
};

VisionCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

VisionCard.defaultProps = {
  delay: 0,
};

const ValueItem = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{title}</h4>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
};

ValueItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const Vision = () => {
  // Vision et mission
  const visionItems = [
    {
      icon: Compass,
      title: "Notre Vision",
      description: "connecter les gens et les communautes par le transport."
    },
    {
      icon: Target,
      title: "Notre Mission",
      description: "Connecter les gens et les communautés par un service de transport fiable, confortable et innovant, contribuant au développement économique et social de la région."
    },
    {
      icon: Star,
      title: "Notre Promesse",
      description: "L'assurance de voyager ! Nous garantissons ponctualité, sécurité et confort pour tous vos déplacements.",
    }
  ];

  // Objectifs à long terme
  const objectives = [
    {
      icon: TrendingUp,
      title: "Expansion Régionale",
      description: "Étendre notre réseau à toutes les villes principales du Nord d'Haïti dans les 5 prochaines années."
    },
    {
      icon: Lightbulb,
      title: "Innovation Continue",
      description: "Intégrer les dernières technologies pour améliorer constamment l'expérience de nos passagers."
    },
    {
      icon: Globe,
      title: "Impact Environnemental",
      description: "Réduire notre empreinte carbone en introduisant des véhicules écoénergétiques d'ici 2026."
    },
    {
      icon: CircleDollarSign,
      title: "Croissance Durable",
      description: "Atteindre un chiffre d'affaires de 55 millions de gourdes tout en maintenant notre engagement envers la qualité de service."
    }
  ];

  // Nos valeurs
  const values = [
    {
      icon: Heart,
      title: "Service client exceptionnel",
      description: "Nous plaçons nos clients au cœur de chaque décision, en veillant à ce que leur expérience soit toujours positive."
    },
    {
      icon: Star,
      title: "Excellence opérationnelle",
      description: "Nous nous efforçons de maintenir les plus hauts standards dans tous les aspects de notre service."
    },
    {
      icon: Target,
      title: "Innovation constante",
      description: "Nous recherchons continuellement de nouvelles façons d'améliorer et de moderniser nos services."
    }
  ];

  return (
    <Section 
      id="vision" 
      title="Mission et Vision" 
      subtitle="Les principes directeurs qui inspirent toutes nos actions."
    >
      {/* Vision, Mission et Promesse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {visionItems.map((item, index) => (
          <VisionCard 
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Citation inspirante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-primary/5 dark:bg-primary/10 rounded-xl p-8 mb-16 text-center"
      >
        <blockquote className="text-xl md:text-2xl italic text-gray-700 dark:text-gray-300 mb-4">
          &quot;Notre ambition est de transformer le transport en commun en Haïti, un trajet à la fois.&quot;
        </blockquote>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          — L&apos;équipe fondatrice de LIMAJS MOTORS
        </p>
      </motion.div>

      {/* Objectifs à long terme */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Nos Objectifs à Long Terme
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Voici comment nous envisageons l&apos;avenir de LIMAJS MOTORS et son impact sur la communauté.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map((objective, index) => (
            <VisionCard 
              key={objective.title}
              icon={objective.icon}
              title={objective.title}
              description={objective.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Nos valeurs */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Nos Valeurs Fondamentales
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ces principes fondamentaux guident chacune de nos actions et décisions au quotidien.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <ValueItem 
                icon={value.icon}
                title={value.title}
                description={value.description}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Vous souhaitez en apprendre davantage sur notre vision et comment nous transformons 
          le paysage du transport en commun en Haïti?
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.href = '/a-propos'}
        >
          Découvrir notre histoire
        </Button>
      </motion.div>
    </Section>
  );
};

export default Vision;
