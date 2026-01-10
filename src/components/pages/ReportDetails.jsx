// src/components/pages/ReportDetails.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// Import des images
import image1 from '../../assets/images/report/image1.png';
import image2 from '../../assets/images/report/image2.png';
import image3 from '../../assets/images/report/images3.png';
import image4 from '../../assets/images/report/images4.png';
import image5 from '../../assets/images/report/image5.png';
import image6 from '../../assets/images/report/image6.png';
import image7 from '../../assets/images/report/image7.png';
import image8 from '../../assets/images/report/image8.png';
import image9 from '../../assets/images/report/image9.png';
import image10 from '../../assets/images/report/image10.png';
import image11 from '../../assets/images/report/image11.png';
import image12 from '../../assets/images/report/image12.jpg';
import image13 from '../../assets/images/report/image13.jpg';
import image14 from '../../assets/images/report/image15.jpg';
import image15 from '../../assets/images/report/image15.jpg';
import image16 from '../../assets/images/report/image16.jpg';
import image17 from '../../assets/images/report/image17.png';

// Données pour les tableaux
const realisationsData = [
  { description: "Discussion et accord avec un service tier pour l'écriture de la première version du logo de l'entreprise", date: "Février 2024", status: "Complété" },
  { description: "Discussion avec BUS KO pour le développement d'un système informatique pour le service de transport", date: "Février 2024", status: "Complété" },
  { description: "Rencontre d'information avec les parents d'élèves, les étudiants et les employés de la cité du savoir", date: "Mai 2024", status: "Complété" },
  { description: "Lancement d'un sondage auprès du publique cible pour l'offre du service de transport", date: "Mai 2024", status: "Complété" },
  { description: "Présentation de l'entreprise au potentiel actionnaires", date: "Juin 2024", status: "Complété" },
  { description: "Appel à manifestation d'intérêt pour achat d'action", date: "Juin 2024", status: "Complété" },
  { description: "Appel à manifestation d'intérêt auprès du public cible pour un abonnement au service de transport", date: "Juin 2024", status: "Complété" },
  { description: "Période de dépôt d'action par les actionnaires", date: "Juillet-Août 2024", status: "Complété" },
  { description: "Période de souscription au service d'abonnement par le public cible", date: "Juillet-Août 2024", status: "Complété" },
  { description: "Préparation de carte NFC pour les usagers du service de transport", date: "Juillet-Août 2024", status: "Complété" },
  { description: "Recrutement d'une agente de sureté (AS) pour assurer la sécurité des enfants dans le bus", date: "Août 2024", status: "Complété" },
  { description: "Achat de service de transport d'un service tier pour le lancement du service de transport", date: "Août 2024", status: "Complété" },
  { description: "Lancement du service de transport au niveau de la cité du savoir", date: "Octobre 2024 (01)", status: "Complété" },
  { description: "Présentation de l'entreprise au niveau du brunch 2024 de l'ISTEAH", date: "Octobre 2024", status: "Complété" },
  { description: "Mise en ligne du site internet de LIMAJS MOTORS SA (limajsmotors.com)", date: "Décembre 2024", status: "Complété" },
  { description: "Développement d'application IOS et Android pour les usagers du service", date: "Décembre 2024", status: "Phase test" },
  { description: "Achat d'un bus de 18 places pour assurer l'autonomie du service", date: "Décembre 2024", status: "Complété" },
  { description: "Recrutement d'un chauffeur de bus pour le transport des usagers du service", date: "Décembre 2024", status: "Complété" },
  { description: "Sondage sur la satisfaction des usagers du service durant son lancement depuis 01 octobre 2024", date: "Décembre 2024", status: "Complété" },
  { description: "Mise en place du domaine d'internet pour le service email de l'entreprise (mainoffice@limajs.com)", date: "Janvier 2025", status: "Complété" },
];

const perspectivesData = [
  { isHeader: true, title: "2025 - Expansion et consolidation" },
  { description: "Nouveau sondage auprès du grand publique pour l'offre de service", date: "Mai 2025" },
  { description: "Recrutement d'une agente de promotion (AP)", date: "Mai 2025" },
  { description: "Présentation de l'entreprise auprès de nouveaux potentiels actionnaires", date: "Mai 2025" },
  { description: "Lancement d'une seconde manifestation d'intérêt pour achat d'action dans l'entreprise", date: "Mai 2025" },
  { description: "Demande de prêt pour l'achat de nouveaux véhicules", date: "Mai 2025" },
  { description: "Promotion dans les écoles, les universités et les entreprises de la ville du Cap-Haitien", date: "Juin 2025" },
  { description: "Appel à manifestation d'intérêt pour un abonnement au service de transport", date: "Juin 2025" },
  { description: "Période de souscription au service d'abonnement par le public cible", date: "Juin-Juillet 2025" },
  { description: "Période de dépôt d'action par les actionnaires", date: "Juillet-Octobre 2025" },
  { description: "Ouverture de trois nouveaux circuits pour le service (Haut du cap-Cité du savoir, Morne rouge-Cap-Haitien, Madeline-Cap-Haitien)", date: "Août 2025" },
  { description: "Achat de nouveaux véhicules pour les nouveaux circuits", date: "Août-Décembre 2025" },
  { description: "Reprise de service au niveau de la cité du savoir", date: "Septembre 2025" },
  { isHeader: true, title: "2026 - Consolidation et lancement au grand public" },
  { description: "Recherche d'un fournisseur de kiosque d'attente", date: "Janvier 2026" },
  { description: "Achat ou preparation de Kiosque d'attente", date: "Mars 2026" },
  { description: "Installation de kiosque d'attente pour les circuits de transport", date: "Juin-Août 2026" },
  { description: "Discussion avec un fournisseur de carte NFC et d'un système informatique pour la vente de carte", date: "Juillet 2026" },
  { description: "Mise en place d'un système de vente de carte NFC pour l'accès au service de transport", date: "Août 2026" },
  { description: "Installation de bureau de vente de carte de transport", date: "Novembre 2026" },
  { description: "Lancement de LIMAJS MOTORS SA au grand public", date: "Décembre 2026" },
  { description: "Ouverture du service au grand public", date: "Décembre 2026" },
];


const ReportDetails = () => {
  const [activeSection, setActiveSection] = useState('preambule');
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const reportSections = {
    preambule: useRef(null),
    organisation: useRef(null),
    realisations: useRef(null),
    perspectives: useRef(null),
    conclusion: useRef(null),
    photos: useRef(null)
  };

  const progressBarWidth = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "100%"]
  );

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Observer pour détecter quelle section est visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-100px 0px -100px 0px"
      }
    );

    // Observer chaque section
    Object.keys(reportSections).forEach(key => {
      if (reportSections[key].current) {
        observer.observe(reportSections[key].current);
      }
    });

    return () => {
      Object.keys(reportSections).forEach(key => {
        if (reportSections[key].current) {
          observer.unobserve(reportSections[key].current);
        }
      });
    };
  }, []); // Dépendances vides pour n'exécuter qu'au montage/démontage

  const scrollToSection = (sectionId) => {
    reportSections[sectionId].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  };

  return (
    <>
      <Helmet>
        <title>Rapport d&apos;Activité 2023-2024 | LIMAJS MOTORS SA</title>
        <meta name="description" content="Rapport d'activité 2023-2024 de LIMAJS MOTORS SA, présentant les réalisations et perspectives de notre entreprise de transport." />
      </Helmet>

      {/* Barre de progression flottante */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary/30 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />

      {/* Bannière principale avec effet parallaxe */}
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image1})`,
            backgroundPosition: 'center',
            filter: 'brightness(0.6)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-center text-white container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-md">
              Rapport d&apos;Activité
            </h1>
            <div className="h-1 w-24 bg-primary mx-auto mb-6"></div>
            <p className="text-xl md:text-3xl text-white/90 drop-shadow-md mb-8">
              2023-2024
            </p>
            <a href="#preambule" className="btn btn-primary">
              Lire le rapport
            </a>
          </motion.div>
        </div>
      </div>

      {/* Navigation latérale sticky */}
      <div className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <ul className="space-y-3">
            {Object.keys(reportSections).map((section) => (
              <li key={section}>
                <button
                  onClick={() => scrollToSection(section)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeSection === section
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation en haut pour mobile */}
      <div className="sticky top-16 lg:hidden z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container-custom py-4 overflow-x-auto">
          <div className="flex space-x-4">
            {Object.keys(reportSections).map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                  activeSection === section
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <motion.div
          className="h-1 bg-primary/30"
          style={{ width: progressBarWidth }}
        />
      </div>

      {/* Contenu principal */}
      <div ref={containerRef} className="bg-white dark:bg-gray-900">
        <div className="container-custom py-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Section 1: Préambule */}
            <motion.section
              id="preambule"
              ref={reportSections.preambule}
              className="mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-8">
                <div className="h-10 w-1 bg-primary mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold">1. Préambule</h2>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="relative float-right ml-6 mb-6 w-full sm:w-64 md:w-80">
                  <img
                    src={image2}
                    alt="Transport scolaire LIMAJS MOTORS SA"
                    className="rounded-lg shadow-xl w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-lg transform rotate-3 -z-10"></div>
                </div>
                <p className="text-lg leading-relaxed mb-6">
                  À la fin de l&apos;année 2021 plusieurs étudiantes et étudiants de l&apos;ISTEAH ont pris l&apos;initiative de mettre en œuvre une entreprise de transport dénommée <span className="font-semibold text-primary">LIMAJS MOTORS SA</span>. Cette initiative a été motivée par le désir de résoudre le problème de mobilité quotidienne des écoliers, des universitaires et des professionnels de la communauté, d&apos;une part, et les membre la communauté d&apos;autre part, qui rencontrent quotidiennement d&apos;énormes difficultés pour vaquer à leurs activités.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Le <span className="font-semibold">01 octobre 2024</span>, le service a été lancé au niveau de la Cité du Savoir et quotidiennement une quinzaine d&apos;écoliers du Centre de la Petite Enfance Paul Gerin Lajoie et de l&apos;École Fondamentale Anne Nelly Saint-Preux sont transportés de leur demeure à la Cité du Savoir et vice versa. Ce que l&apos;équipe de LIMAJS MOTORS SA qualifie de pari réussi.
                </p>
                <p className="text-lg leading-relaxed">
                  Ce rapport fait état de l&apos;entreprise, de son cheminement et de ces réalisations durant l&apos;année fiscale 2023-2024 et de ses perspectives pour la période de 2025-2026.
                </p>
                <div className="my-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary">
                  <blockquote className="text-xl italic font-medium">
                    &quot;LIMAJS MOTORS SA, l&apos;accès et l&apos;assurance de voyager !&quot;
                  </blockquote>
                </div>
              </div>
            </motion.section>

            {/* Section 2: L'organisation */}
            <motion.section
              id="organisation"
              ref={reportSections.organisation}
              className="mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-8">
                <div className="h-10 w-1 bg-secondary mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold">2. L&apos;organisation</h2>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-6">
                  LIMAJS MOTORS SA vise à connecter les gens et les communautés par le transport. Elle se donne pour mission de favoriser particulièrement la mobilité durable des écoliers, des universitaires et des professionnels par des systèmes de transport sécuritaires et accessibles. Ses actions se fondent d&apos;une part, sur l&apos;excellence, une façon d&apos;offrir continuellement un service de qualité optimale, rigoureux et respectueux qui valorise les parties prenantes et qui s&apos;inspire des meilleurs pratiques des systèmes de transports internationaux. D&apos;autres part, sur le réseautage, une façon d&apos;assurer la bonne liaison entre les acteurs du service tant local que régional, tant national qu&apos;international. Et enfin, la multiplication, une façon d&apos;assurer la durabilité du service dans le temps et dans l&apos;espace et garantir un effort de partenariat à l&apos;échelle mondiale.
                </p>
                <div className="relative my-12">
                  <img
                    src={image5}
                    alt="Équipe LIMAJS MOTORS SA"
                    className="rounded-lg shadow-xl w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                    <p className="text-white font-medium">Notre équipe s&apos;engage à offrir un service de transport de qualité accessible à tous.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 3: Réalisations */}
            <motion.section
              id="realisations"
              ref={reportSections.realisations}
              className="mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-8">
                <div className="h-10 w-1 bg-primary mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold">3. Réalisations</h2>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-10">
                  Cette section fait état des différentes réalisations de l&apos;entreprise jusqu&apos;ici. Le tableau ci-dessous présente étapes par étapes les actions entreprises durant la période 2023 à 2025.
                </p>
                <div className="mb-12">
                  <h3 className="text-xl font-bold mb-6">Tableau détaillé des réalisations</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold">Description</th>
                          <th className="py-3 px-4 text-left font-semibold">Date</th>
                          <th className="py-3 px-4 text-left font-semibold">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {realisationsData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                            <td className="py-3 px-4">{item.description}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{item.date}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.status === 'Complété' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.section>
            
            {/* Section 4: Perspectives 2026 */}
            <motion.section
              id="perspectives"
              ref={reportSections.perspectives}
              className="mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-8">
                <div className="h-10 w-1 bg-secondary mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold">4. Perspectives 2026</h2>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-10">
                  Dès le lancement du service le 01 octobre 2024 dernier, les usagers du service se sont montrés très satisfaits. Lors de notre dernier sondage, la satisfaction n&apos;a pas changé, cependant, par rapport à certaines difficultés mécanique venant du véhicule, ils souhaitent que nous ayons des véhicules de secours pour compenser. Ce qui nous ramène à cette section qui présente les perspectives de l&apos;entreprise pour la période de 2025 à 2026.
                </p>
                <div className="my-8 flex justify-center">
                  <div className="relative">
                    <img
                      src={image7}
                      alt="Perspectives LIMAJS MOTORS SA"
                      className="rounded-lg shadow-xl w-full max-w-2xl h-auto object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-secondary/20 rounded-lg transform rotate-2 -z-10"></div>
                  </div>
                </div>
                 <div className="mb-12">
                  <h3 className="text-xl font-bold mb-6">Tableau des perspectives 2025-2026</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold">Description</th>
                          <th className="py-3 px-4 text-left font-semibold">Date Prévue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {perspectivesData.map((item, index) => (
                           item.isHeader ? (
                            <tr key={index} className="bg-gray-50 dark:bg-gray-750">
                              <td colSpan="2" className="py-2 px-4 font-medium text-primary">{item.title}</td>
                            </tr>
                          ) : (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                              <td className="py-3 px-4">{item.description}</td>
                              <td className="py-3 px-4 whitespace-nowrap">{item.date}</td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.section>
            
            {/* Section 5: Conclusion */}
            <motion.section
              id="conclusion"
              ref={reportSections.conclusion}
              className="mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-8">
                <div className="h-10 w-1 bg-primary mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold">5. Conclusion</h2>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="relative my-8">
                  <img
                    src={image8}
                    alt="Équipe LIMAJS MOTORS SA"
                    className="rounded-lg shadow-xl w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="max-w-3xl mx-auto">
                      <p className="text-xl font-medium italic mb-4">
                        &quot;L&apos;équipe de LIMAJS MOTORS SA fait de son mieux pour offrir au public un service de transport de qualité accessible à tous. Nous continuerons à chercher des partenaires et des bailleurs qui pourront nous aider à atteindre les objectifs que nous nous sommes fixés pour cette période. Cela nous permettra d&apos;offrir le service a plus de personnes.&quot;
                      </p>
                      <div className="flex items-center">
                        <div className="flex-grow h-px bg-white/30"></div>
                        <p className="px-4 text-right">
                          <span className="block font-semibold">Noldey Jean Sonold Janvier</span>
                          <span className="text-sm">CEO, LIMAJS MOTORS SA</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl my-12">
                  <h3 className="text-xl font-bold mb-4">Notre vision pour l&apos;avenir</h3>
                  <p className="mb-4">
                    LIMAJS MOTORS SA aspire à devenir un acteur majeur dans le domaine du transport en Haïti, en offrant des solutions de mobilité sécuritaires, fiables et accessibles à tous.
                  </p>
                  <p>
                    Nous vous invitons à suivre notre progression et à nous contacter pour toute information supplémentaire concernant nos services ou pour explorer des opportunités de partenariat.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link to="/contact" className="btn btn-primary">
                      Nous contacter
                    </Link>
                    <Link to="/investir" className="btn btn-outline">
                      Opportunités d&apos;investissement
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 6: Galerie photos */}
            <motion.section
              id="photos"
              ref={reportSections.photos}
              className="mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-8">
                <div className="h-10 w-1 bg-secondary mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold">6. Annexe : Photos</h2>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-10">
                  Découvrez en images les activités, l&apos;équipe et les services de LIMAJS MOTORS SA.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                  {[image1, image2, image3, image4, image5, image6, image9, image10, image11, image12, image13, image14, image15, image16, image17].map((img, index) => (
                     <motion.div
                      key={index}
                      className="group relative overflow-hidden rounded-xl shadow-lg aspect-[4/3]"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={img}
                        alt={`Galerie LIMAJS MOTORS SA ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm">Image {index + 1}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </>
  );
};

export default ReportDetails;
