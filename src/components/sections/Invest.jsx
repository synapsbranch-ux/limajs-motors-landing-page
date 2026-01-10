// src/components/sections/Invest.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Award, Users, BarChart3, LineChart, PieChart } from 'lucide-react';

// Composants
import Section from '../ui/Section';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const InvestmentStats = ({ value, label, icon: Icon, prefix = '', suffix = '' }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
    <h3 className="text-2xl md:text-3xl font-bold mb-2">
      {prefix}{value}{suffix}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm">
      {label}
    </p>
  </motion.div>
);

InvestmentStats.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
};

InvestmentStats.defaultProps = {
  prefix: '',
  suffix: '',
};

const Invest = () => {
  // Données du marché
  const marketData = [
    {
      icon: TrendingUp,
      value: "2.16",
      prefix: "G ",
      label: "Milliards de gourdes, taille potentielle du marché"
    },
    {
      icon: BarChart3,
      value: "150",
      prefix: "G +",
      label: "Millions de gourdes par année au niveau du Nord"
    },
    {
      icon: PieChart,
      value: "55",
      prefix: "G ",
      label: "Millions de gourde, part visée (37,21%)"
    }
  ];

  // Types d'actions
  const shareTypes = [
    {
      title: "Actions privilégiées",
      price: "100 USD",
      benefits: [
        "Priorité sur les dividendes",
        "Droit de vote aux assemblées",
        "Rapports financiers trimestriels",
        "Accès préférentiel aux nouvelles offres"
      ],
      badge: "Recommandé"
    },
    {
      title: "Actions ordinaires",
      price: "80 USD",
      benefits: [
        "Dividendes selon performance",
        "Droit de vote aux assemblées",
        "Rapports financiers annuels",
        "Participation à la croissance"
      ]
    }
  ];

  // Avantages concurrentiels
  const advantages = [
    {
      title: "Service Client Exceptionnel",
      description: "Notre priorité absolue est la satisfaction client. Nos chauffeurs et personnel sont formés pour offrir un service de haute qualité.",
      icon: Users
    },
    {
      title: "Technologie Innovante",
      description: "Notre système de paiement sans contact par carte NFC facilite une mobilité facile et flexible des utilisateurs.",
      icon: LineChart
    },
    {
      title: "Positionnement Stratégique",
      description: "Dans un marché à fort potentiel, nous nous distinguons par notre approche moderne du transport en commun dans le Nord d'Haïti.",
      icon: Award
    }
  ];

  return (
    <Section 
      id="invest" 
      title="Investir dans LIMAJS MOTORS" 
      subtitle="Une opportunité d'investissement dans un secteur prometteur avec un potentiel de croissance significatif."
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      {/* Introduction à l'investissement */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h3 className="text-2xl font-bold mb-6 text-primary">Analyse du Marché</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Le marché du transport en commun dans le Nord est un secteur prometteur en termes de revenus. 
            En plus d&apos;être une zone touristique, de nombreuses personnes et entreprises s&apos;y sont établies 
            depuis le séisme du 12 janvier 2010.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Selon des données de la banque mondiale, dans un rayon supérieur à 1 km, plus de 40% de la population 
            s&apos;éloignent quotidiennement de leur demeure sur une population de plus de 300 000 habitants.
          </p>
        </motion.div>

        {/* Statistiques du marché */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {marketData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <InvestmentStats {...stat} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Opportunités d'Investissement */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Opportunités d&apos;Investissement
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Pour le moment nous recherchons $ 200,000.00 USD de fonds de démarrage et nous lançons 
            un appel à manifestation d&apos;intérêt pour achat d&apos;action.
          </p>
        </motion.div>

        {/* Types d'actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {shareTypes.map((shareType, index) => (
            <motion.div
              key={shareType.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <Card
                title={shareType.title}
                subtitle={`Prix par action: ${shareType.price}`}
                badge={shareType.badge}
                icon={DollarSign}
                hoverable
                variant={shareType.badge ? "default" : "outline"}
                headerClassName={shareType.badge ? "bg-primary/5" : ""}
                footer={
                  <Button 
                    variant={shareType.badge ? "primary" : "outline"} 
                    fullWidth
                    onClick={() => window.location.href = '/investir/actions'}
                  >
                    En savoir plus
                  </Button>
                }
              >
                <ul className="space-y-2 mb-4">
                  {shareType.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center">
                      <span className="mr-2 text-primary">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Objectif financier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center p-6 bg-primary/5 dark:bg-primary/10 rounded-lg max-w-3xl mx-auto"
        >
          <h4 className="text-xl font-bold mb-3">Objectif Financier</h4>
          <p className="text-gray-700 dark:text-gray-300">
            LIMAJS MOTORS SA veut atteindre un chiffre d&apos;affaires de 55 819 790.00 HTG sur 5 ans 
            en garantissant la création d&apos;au moins onze (11) emplois dès la première année.
          </p>
        </motion.div>
      </div>

      {/* Avantages Concurrentiels */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Nos Avantages Concurrentiels
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Dans l&apos;environnement de LIMAJS MOTORS SA plusieurs autres entreprises évoluent dans le secteur, 
            tels que Sans-Soucis, AVIS, Newlook, Legacy, Flex, Taxis privé, etc.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <Card
                title={advantage.title}
                subtitle={advantage.description}
                icon={advantage.icon}
                hoverable
                variant="filled"
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Badge variant="primary" size="lg" className="mb-6">
            Investissez dans le futur du transport
          </Badge>
          <h3 className="text-2xl font-bold mb-4">
            Prêt à investir dans notre vision?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Contactez-nous dès aujourd&apos;hui pour en savoir plus sur nos opportunités d&apos;investissement 
            et comment vous pouvez faire partie de cette aventure prometteuse.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/contact?subject=investment'}
          >
            Nous contacter
          </Button>
        </motion.div>
      </div>
    </Section>
  );
};

export default Invest;
