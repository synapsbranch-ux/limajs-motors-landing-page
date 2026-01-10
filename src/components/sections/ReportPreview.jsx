// src/components/sections/ReportPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Import de l'image principale
import reportImage from '../../assets/images/report/images4.png';

const ReportPreview = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Rapport d&apos;Activité 2023-2024
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            LIMAJS MOTORS SA - L&apos;accès et l&apos;assurance de voyager
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image à gauche */}
            <div className="md:w-1/2">
              <div className="h-full relative">
                <img 
                  src={reportImage} 
                  alt="Transport LIMAJS MOTORS SA" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent opacity-30"></div>
              </div>
            </div>
            
            {/* Contenu à droite */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Notre mission</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Favoriser la mobilité durable des écoliers, des universitaires et des professionnels 
                    par des systèmes de transport sécuritaires et accessibles.
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Réalisations principales</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-3"></span>
                      <span>Lancement du service de transport à la Cité du Savoir (Oct. 2024)</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-3"></span>
                      <span>Achat d&apos;un bus de 18 places pour assurer l&apos;autonomie du service</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-2 w-2 bg-primary rounded-full mr-3"></span>
                      <span>Développement d&apos;applications iOS et Android pour les usagers</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-3">Perspectives 2026</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ouverture de trois nouveaux circuits dans la ville du Cap-Haïtien
                    et lancement du service au grand public.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link 
                  to="/rapport-activite" 
                  className="inline-block py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Consulter le rapport complet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportPreview;