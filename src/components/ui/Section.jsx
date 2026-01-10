// src/components/ui/Section.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

// Importer les animations depuis les utils
import { fadeInUp, scrollReveal, observerConfig } from '../../utils/animations';

const Section = ({
  id,
  title,
  subtitle,
  children,
  className = '',
  bgColor = 'bg-white dark:bg-gray-900',
  containerClassName = '',
  titleClassName = '',
  subtitleClassName = '',
  contentClassName = '',
  withAnimation = true,
  titleAnimation = fadeInUp,
  contentAnimation = scrollReveal,
  titleAs = 'h2',
  subtitleAs = 'p',
}) => {
  // Animer les éléments au défilement
  const variants = {
    title: titleAnimation,
    content: contentAnimation
  };

  // Pour le composant de titre
  const HeadingTag = titleAs;
  const SubheadingTag = subtitleAs;

  return (
    <section id={id} className={`py-16 md:py-24 ${bgColor} ${className}`}>
      <div className={`container mx-auto px-4 md:px-6 ${containerClassName}`}>
        {/* En-tête de section avec titre et sous-titre */}
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16">
            {title && (
              <motion.div
                initial={withAnimation ? "hidden" : false}
                whileInView={withAnimation ? "visible" : false}
                viewport={observerConfig}
                variants={variants.title}
                className="mb-4"
              >
                <HeadingTag 
                  className={`text-3xl md:text-4xl lg:text-5xl font-bold ${titleClassName}`}
                >
                  {title}
                </HeadingTag>
              </motion.div>
            )}
            
            {subtitle && (
              <motion.div
                initial={withAnimation ? "hidden" : false}
                whileInView={withAnimation ? "visible" : false}
                viewport={observerConfig}
                variants={variants.title}
                className="mt-4"
              >
                <SubheadingTag 
                  className={`text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto ${subtitleClassName}`}
                >
                  {subtitle}
                </SubheadingTag>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Contenu principal de la section */}
        <motion.div
          initial={withAnimation ? "hidden" : false}
          whileInView={withAnimation ? "visible" : false}
          viewport={observerConfig}
          variants={variants.content}
          className={contentClassName}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
};

Section.propTypes = {
  id: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  bgColor: PropTypes.string,
  containerClassName: PropTypes.string,
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  withAnimation: PropTypes.bool,
  titleAnimation: PropTypes.object,
  contentAnimation: PropTypes.object,
  titleAs: PropTypes.string,
  subtitleAs: PropTypes.string,
};

export default Section;