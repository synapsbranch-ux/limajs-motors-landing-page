// src/components/pages/ServiceDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Bus, 
  Calendar, 
  Car, 
  Package, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CreditCard, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Shield 
} from 'lucide-react';

// Composants
import Section from '../ui/Section';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SubscriptionCard from '../ui/SubscriptionCard';

// Services data
const servicesData = {
  'transport-urbain': {
    title: 'Transport Urbain et Interurbain',
    description: 'Un service régulier et ponctuel à travers Cap-Haïtien et ses environs.',
    longDescription: `Notre service de transport urbain et interurbain est conçu pour offrir des déplacements fiables, 
    confortables et ponctuels à travers Cap-Haïtien et ses environs. Avec une flotte de véhicules modernes et 
    des chauffeurs professionnels, nous assurons des trajets sécurisés pour tous nos passagers, qu'ils soient 
    écoliers, étudiants, employés ou grand public.`,
    icon: Bus,
    image: '/assets/images/tech/transport-public.jpg',
    features: [
      'Trajets réguliers avec horaires fixes',
      'Véhicules modernes et confortables',
      'Chauffeurs professionnels et formés',
      'Paiement par carte NFC ou espèces',
      'Système de suivi des bus en temps réel',
      'Prix abordables et compétitifs'
    ],
    clientTypes: [
      {
        type: 'ecoliers',
        title: 'Écoliers',
        description: 'Des trajets sécurisés et confortables pour vos petits, chaque jour.',
        icon: Shield,
        benefits: [
          'Transport sécurisé et supervisé',
          'Abonnements à tarifs préférentiels',
          'Horaires adaptés aux écoles',
          'Notification aux parents'
        ]
      },
      {
        type: 'etudiants',
        title: 'Étudiants',
        description: 'Arrivez à l\'heure à vos cours avec notre service de transport rapide et abordable.',
        icon: GraduationCap,
        benefits: [
          'Tarifs réduits avec carte étudiant',
          'Trajets adaptés aux universités',
          'Wifi gratuit à bord',
          'Abonnements mensuels économiques'
        ]
      },
      {
        type: 'employes',
        title: 'Employés',
        description: 'Commencez votre journée de travail sans tracas grâce à notre service de transport efficace.',
        icon: Briefcase,
        benefits: [
          'Trajets express aux heures de pointe',
          'Abonnements entreprise disponibles',
          'Confort optimal pour travailler pendant le trajet',
          'Service de navette personnalisé pour les entreprises'
        ]
      },
      {
        type: 'public',
        title: 'Grand public',
        description: 'Déplacez-vous facilement à travers la ville à un prix abordable.',
        icon: Users,
        benefits: [
          'Trajets fréquents toute la journée',
          'Couverture complète de la ville',
          'Tarifs abordables pour tous',
          'Accessibilité pour personnes à mobilité réduite'
        ]
      }
    ],
    routes: [
      { from: 'Cap-Haïtien', to: 'Milot', schedule: 'Tous les jours, 6h-19h, départ toutes les 30 minutes' },
      { from: 'Cap-Haïtien', to: 'Limbé', schedule: 'Lun-Sam, 7h-18h, départ toutes les heures' },
      { from: 'Cap-Haïtien', to: 'Grande Rivière du Nord', schedule: 'Lun-Ven, 7h-17h, 3 départs par jour' },
      { from: 'Cap-Haïtien', to: 'Quartier Morin', schedule: 'Tous les jours, 6h-18h, départ toutes les 45 minutes' }
    ]
  },
  'abonnements': {
    title: 'Abonnements',
    description: 'Économisez avec nos formules d\'abonnement adaptées à vos besoins.',
    longDescription: `Nos formules d'abonnement sont conçues pour offrir la meilleure valeur à nos utilisateurs réguliers. 
    Économisez sur vos trajets quotidiens et bénéficiez d'avantages exclusifs avec nos différentes options 
    d'abonnement: mensuel, trimestriel ou annuel. Choisissez la formule qui convient le mieux à vos besoins 
    et à votre budget.`,
    icon: Calendar,
    image: '/assets/images/tech/transport-service.jpg',
    features: [
      'Économies significatives sur les trajets réguliers',
      'Différentes formules selon vos besoins',
      'Paiement et gestion via notre application mobile',
      'Trajets illimités selon l\'abonnement choisi',
      'Avantages exclusifs pour les abonnés',
      'Possibilité de suspendre temporairement votre abonnement'
    ],
    subscriptions: [
      {
        title: "Abonnement Mensuel",
        price: 1500,
        period: "mois",
        currency: "HTG",
        description: "Idéal pour les trajets réguliers",
        features: [
          "Trajets illimités sur 1 ligne",
          "Valable 30 jours",
          "Économie de 15% sur le prix standard",
          "Accès à l'application mobile"
        ],
        notIncluded: [
          "Trajets interurbains",
          "Services premium"
        ],
        popular: false
      },
      {
        title: "Abonnement Trimestriel",
        price: 4000,
        period: "trimestre",
        currency: "HTG",
        description: "Notre meilleur rapport qualité-prix",
        features: [
          "Trajets illimités sur 2 lignes",
          "Valable 90 jours",
          "Économie de 25% sur le prix standard",
          "Accès prioritaire aux heures de pointe",
          "Support client dédié"
        ],
        notIncluded: [
          "Services premium"
        ],
        popular: true
      },
      {
        title: "Abonnement Annuel",
        price: 15000,
        period: "an",
        currency: "HTG",
        description: "Pour nos utilisateurs les plus fidèles",
        features: [
          "Trajets illimités sur toutes les lignes",
          "Valable 365 jours",
          "Économie de 35% sur le prix standard",
          "Accès à tous les services standard et premium",
          "Support client VIP",
          "1 mois offert"
        ],
        popular: false
      }
    ]
  },
  'location': {
    title: 'Location de Véhicules',
    description: 'Besoin d\'un véhicule pour vos déplacements personnels? Découvrez notre flotte.',
    longDescription: `Notre service de location de véhicules vous offre une solution flexible pour tous vos 
    besoins de déplacement personnels ou professionnels. Que vous ayez besoin d'une voiture pour une journée, 
    d'un minibus pour un événement ou d'un bus pour une excursion de groupe, notre flotte diversifiée 
    de véhicules bien entretenus est à votre disposition.`,
    icon: Car,
    image: '/assets/images/tech/transport-service.jpg',
    features: [
      'Large gamme de véhicules disponibles',
      'Tarifs compétitifs avec options d\'assurance',
      'Procédure de réservation simple et rapide',
      'Véhicules récents et bien entretenus',
      'Options de location courte et longue durée',
      'Service de livraison du véhicule disponible'
    ],
    vehicles: [
      {
        type: 'Voitures',
        models: [
          { name: 'Berline Compact', capacity: '4 personnes', pricePerDay: '3,500 HTG', features: ['Climatisation', 'Radio', 'Économique'] },
          { name: 'SUV Confort', capacity: '5 personnes', pricePerDay: '5,000 HTG', features: ['Climatisation', 'GPS', 'Bluetooth', 'Spacieux'] }
        ]
      },
      {
        type: 'Minibus',
        models: [
          { name: 'Minibus Standard', capacity: '15 personnes', pricePerDay: '8,000 HTG', features: ['Climatisation', 'Sièges confortables', 'Idéal pour groupes'] },
          { name: 'Minibus Premium', capacity: '12 personnes', pricePerDay: '10,000 HTG', features: ['Climatisation', 'Sièges luxueux', 'Système audio', 'Wifi'] }
        ]
      },
      {
        type: 'Bus',
        models: [
          { name: 'Bus Standard', capacity: '30 personnes', pricePerDay: '15,000 HTG', features: ['Climatisation', 'Sièges confortables', 'Parfait pour excursions'] },
          { name: 'Bus VIP', capacity: '25 personnes', pricePerDay: '20,000 HTG', features: ['Climatisation', 'Sièges luxueux inclinables', 'Système divertissement', 'Wifi', 'Toilettes'] }
        ]
      }
    ],
    requirements: [
      'Permis de conduire valide depuis plus de 2 ans',
      'Carte d\'identité ou passeport',
      'Dépôt de garantie',
      'Âge minimum de 23 ans'
    ]
  },
  'livraison': {
    title: 'Livraison et Coursier',
    description: 'Nous transportons vos colis avec une fiabilité exemplaire',
    longDescription: `Notre service de livraison et coursier assure le transport rapide et sécurisé de vos 
    colis, documents et marchandises à travers Cap-Haïtien et ses environs. Que vous soyez un particulier 
    ou une entreprise, nous proposons des solutions adaptées à vos besoins, avec la même ponctualité et 
    fiabilité que pour nos services de transport de passagers.`,
    icon: Package,
    image: '/assets/images/tech/transport-service.jpg',
    features: [
      'Livraison express en ville (moins de 3 heures)',
      'Livraison standard (même jour ou jour suivant)',
      'Suivi en temps réel de vos colis',
      'Assurance sur tous les envois',
      'Service disponible pour particuliers et entreprises',
      'Options de livraison sur mesure'
    ],
    deliveryTypes: [
      {
        name: 'Livraison Express',
        timeframe: 'Moins de 3 heures',
        price: 'À partir de 500 HTG',
        description: 'Pour vos envois urgents en ville'
      },
      {
        name: 'Livraison Standard',
        timeframe: 'Même jour ou jour suivant',
        price: 'À partir de 300 HTG',
        description: 'Pour vos envois réguliers sans urgence particulière'
      },
      {
        name: 'Livraison Programmée',
        timeframe: 'À la date et heure de votre choix',
        price: 'À partir de 400 HTG',
        description: 'Planifiez à l\'avance vos livraisons importantes'
      },
      {
        name: 'Service Coursier Dédié',
        timeframe: 'Sur demande',
        price: 'À partir de 2,000 HTG/jour',
        description: 'Un coursier à votre disposition pour toutes vos courses de la journée'
      }
    ],
    packageTypes: [
      'Documents et courriers',
      'Petits colis (jusqu\'à 5kg)',
      'Colis moyens (5-20kg)',
      'Grands colis (20-50kg)',
      'Marchandises spéciales (sur devis)'
    ]
  }
};

const ServiceDetails = () => {
  const { serviceType } = useParams();
  const location = useLocation();
  const [clientFilter, setClientFilter] = useState(null);
  const [service, setService] = useState(null);

  // Extraire le filtre client de l'URL si présent
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const client = queryParams.get('client');
    if (client) {
      setClientFilter(client);
    } else {
      setClientFilter(null);
    }
  }, [location]);

  // Charger les données du service
  useEffect(() => {
    if (serviceType && servicesData[serviceType]) {
      setService(servicesData[serviceType]);
    } else {
      // Rediriger vers la page services si le type n'existe pas
      // Dans un environnement réel, vous utiliseriez navigate de react-router-dom
      // window.location.href = '/services';
    }
  }, [serviceType]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.title} | LIMAJS MOTORS</title>
        <meta name="description" content={service.longDescription} />
      </Helmet>
      
      <div className="pt-20 pb-16 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6 text-sm">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-primary">
              Services
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-primary font-medium">{service.title}</span>
          </div>
          
          {/* En-tête du service */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <service.icon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{service.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {service.longDescription}
            </p>
          </div>
        </div>
      </div>
      
      {/* Contenu spécifique selon le type de service */}
      {serviceType === 'transport-urbain' && (
        <>
          {/* Clientèles */}
          <Section 
            title="Nos Solutions par Clientèle" 
            subtitle="Des services adaptés aux besoins spécifiques de chaque type de passager."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {service.clientTypes.map((client) => (
                <motion.div
                  key={client.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${clientFilter === client.type ? 'ring-2 ring-primary' : ''}`}
                >
                  <Card
                    title={client.title}
                    subtitle={client.description}
                    icon={client.icon}
                    hoverable
                    variant="filled"
                    badge={clientFilter === client.type ? "Sélectionné" : null}
                  >
                    <ul className="mt-4 space-y-2">
                      {client.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2 text-primary">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Itinéraires */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Nos Itinéraires</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Départ</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Destination</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Horaires</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {service.routes.map((route, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{route.from}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{route.to}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{route.schedule}</td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = '/contact'}
                            >
                              Réserver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}
      
      {serviceType === 'abonnements' && (
        <Section 
          title="Nos Formules d'Abonnement" 
          subtitle="Économisez sur vos trajets réguliers avec nos différentes formules d'abonnement."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {service.subscriptions.map((subscription, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <SubscriptionCard
                  title={subscription.title}
                  price={subscription.price}
                  period={subscription.period}
                  currency={subscription.currency}
                  description={subscription.description}
                  features={subscription.features}
                  notIncluded={subscription.notIncluded}
                  popular={subscription.popular}
                  onSubscribe={() => window.location.href = '/contact?subject=subscription'}
                />
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-12">
            <h3 className="text-xl font-bold mb-4 text-center">Comment souscrire</h3>
            <ol className="space-y-4 ml-6 list-decimal">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Choisissez votre formule</span> - Sélectionnez l&apos;abonnement qui correspond le mieux à vos besoins
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Contactez-nous</span> - Rendez-vous dans nos bureaux ou contactez-nous en ligne
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Finalisez votre inscription</span> - Fournissez vos informations et effectuez le paiement
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Recevez votre carte</span> - Récupérez votre carte d&apos;abonnement et commencez à économiser !
              </li>
            </ol>
          </div>
        </Section>
      )}
      
      {serviceType === 'location' && (
        <Section 
          title="Notre Flotte de Véhicules" 
          subtitle="Des véhicules adaptés à tous vos besoins de déplacement."
        >
          {service.vehicles.map((category, categoryIndex) => (
            <div key={category.type} className="mb-12">
              <h3 className="text-2xl font-bold mb-6">{category.type}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.models.map((model, modelIndex) => (
                  <motion.div
                    key={`${categoryIndex}-${modelIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: modelIndex * 0.1 }}
                  >
                    <Card
                      title={model.name}
                      subtitle={`Capacité: ${model.capacity}`}
                      badge={`${model.pricePerDay}/jour`}
                      hoverable
                      variant="filled"
                    >
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {model.features.map((feature, idx) => (
                            <Badge key={idx} variant="primary" size="sm">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-bold mb-4">Conditions de location</h3>
            <ul className="space-y-2 ml-6 list-disc">
              {service.requirements.map((req, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {req}
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/contact?subject=car-rental'}
              >
                Demander un devis
              </Button>
            </div>
          </div>
        </Section>
      )}
      
      {serviceType === 'livraison' && (
        <Section 
          title="Nos Services de Livraison" 
          subtitle="Des solutions rapides et fiables pour tous vos besoins de livraison."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {service.deliveryTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  title={type.name}
                  subtitle={type.description}
                  variant="filled"
                  hoverable
                  icon={Package}
                >
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Délai:</span>
                      <span className="font-medium">{type.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tarif:</span>
                      <span className="font-medium">{type.price}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">Types de Colis Acceptés</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {service.packageTypes.map((type, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center shadow-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Pour les livraisons spéciales ou les demandes personnalisées, contactez-nous directement.
              </p>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/contact?subject=delivery'}
              >
                Demander un service de livraison
              </Button>
            </div>
          </div>
        </Section>
      )}
      
      {/* Caractéristiques communes à tous les services */}
      <Section 
        title="Caractéristiques" 
        subtitle="Ce qui rend notre service unique" 
        bgColor="bg-gray-50 dark:bg-gray-900"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {service.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <div className="mr-4 text-primary">•</div>
                <p className="text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
      
      {/* CTA */}
      <Section>
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à utiliser notre service?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Contactez-nous dès aujourd&apos;hui pour obtenir plus d&apos;informations ou pour réserver.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => window.location.href = '/contact'}
            >
              Contactez-nous
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/services'}
            >
              Explorer d&apos;autres services
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
};

export default ServiceDetails;