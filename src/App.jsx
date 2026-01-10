// src/App.jsx
import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';

// Context
import { AppProvider } from './context/AppContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Lazy load page sections
const Hero = React.lazy(() => import('./components/sections/Hero'));
const Services = React.lazy(() => import('./components/sections/Services'));
const About = React.lazy(() => import('./components/sections/About'));
const Features = React.lazy(() => import('./components/sections/Features'));
const Partners = React.lazy(() => import('./components/sections/Partners'));
const Contact = React.lazy(() => import('./components/sections/Contact'));
const Invest = React.lazy(() => import('./components/sections/Invest'));
const ReportPreview = React.lazy(() => import('./components/sections/ReportPreview'));

// Lazy load page components for nested routes
const ServiceDetails = React.lazy(() => import('./components/pages/ServiceDetails'));
const AboutDetails = React.lazy(() => import('./components/pages/AboutDetails'));
const InvestDetails = React.lazy(() => import('./components/pages/InvestDetails'));
const ReportDetails = React.lazy(() => import('./components/pages/ReportDetails'));

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="loader"></div>
  </div>
);

const App = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Handle scroll restoration
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HelmetProvider>
      <AppProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          
          <main className="flex-grow">
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode='wait'>
                <Routes location={location} key={location.pathname}>
                  {/* Page d'accueil */}
                  <Route 
                    path="/" 
                    element={
                      <>
                        <Hero />
                        <Services />
                        <ReportPreview /> {/* Ajout du composant ReportPreview ici */}
                        <About />
                        <Features />
                        <Partners />
                        <Contact />
                      </>
                    } 
                  />
                  
                  {/* Routes Services */}
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:serviceType" element={<ServiceDetails />} />
                  
                  {/* Routes À Propos */}
                  <Route path="/a-propos" element={<About />} />
                  <Route path="/a-propos/:section" element={<AboutDetails />} />
                  
                  {/* Routes Investir */}
                  <Route path="/investir" element={<Invest />} />
                  <Route path="/investir/:section" element={<InvestDetails />} />
                  
                  {/* Route Rapport d'Activité */}
                  <Route path="/rapport-activite" element={<ReportDetails />} />
                  
                  {/* Pages indépendantes */}
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/partenaires" element={<Partners />} />
                  
                  {/* Page 404 */}
                  <Route 
                    path="*" 
                    element={
                      <div className="flex items-center justify-center min-h-[70vh] flex-col text-center px-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary">404</h1>
                        <p className="text-xl md:text-2xl mb-6">Page non trouvée</p>
                        <p className="mb-8 text-gray-600 max-w-md">
                          La page que vous recherchez n&apos;existe pas ou a été déplacée.
                        </p>
                        <a href="/" className="btn btn-primary">
                          Retour à l&apos;accueil
                        </a>
                      </div>
                    } 
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>

          <Footer />
        </div>
      </AppProvider>
    </HelmetProvider>
  );
};

export default App;