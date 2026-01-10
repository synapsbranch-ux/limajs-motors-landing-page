// src/components/ui/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Card = ({ 
  title, 
  subtitle,
  children, 
  image,
  icon: Icon,
  className = '',
  hoverable = true,
  onClick,
  to,
  badge,
  variant = 'default',
  footer,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}) => {
  // Déterminer le composant à utiliser en fonction des props
  const CardComponent = to ? Link : onClick ? motion.div : motion.div;
  const cardProps = to ? { to } : onClick ? { onClick } : {};
  
  // Variantes pour les animations
  const hoverAnimation = hoverable ? {
    rest: { y: 0, transition: { duration: 0.2, ease: "easeInOut" } },
    hover: { y: -10, transition: { duration: 0.3, ease: "easeInOut" } }
  } : {};

  // Styles selon la variante
  const variantStyles = {
    default: "bg-white dark:bg-gray-800 shadow-card",
    outline: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    filled: "bg-primary/5 dark:bg-primary/10",
    elevated: "bg-white dark:bg-gray-800 shadow-lg",
  };

  return (
    <CardComponent
      className={`
        rounded-xl overflow-hidden
        transition-all duration-300
        ${variantStyles[variant]}
        ${onClick || to ? 'cursor-pointer' : ''}
        ${className}
      `}
      initial="rest"
      whileHover={hoverable ? "hover" : undefined}
      variants={hoverAnimation}
      {...cardProps}
    >
      {/* Image d'en-tête avec overlay pour l'icône ou badge */}
      {(image || Icon) && (
        <div className={`relative overflow-hidden ${headerClassName}`}>
          {image && (
            <motion.div
              whileHover={{ scale: hoverable ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
              className="aspect-video w-full"
            >
              <img
                src={image}
                alt={title || 'Card image'}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
          
          {Icon && !image && (
            <div className="aspect-[3/1] w-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
              <Icon size={48} className="text-primary" />
            </div>
          )}
          
          {Icon && image && (
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-md">
              <Icon size={24} className="text-primary" />
            </div>
          )}
          
          {badge && (
            <div className="absolute top-4 left-4 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
              {badge}
            </div>
          )}
        </div>
      )}
      
      {/* Corps de la carte */}
      <div className={`p-6 ${bodyClassName}`}>
        {title && (
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {subtitle}
          </p>
        )}

        {children}
      </div>
      
      {/* Pied de carte optionnel */}
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-100 dark:border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </CardComponent>
  );
};

Card.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  image: PropTypes.string,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
  to: PropTypes.string,
  badge: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'outline', 'filled', 'elevated']),
  footer: PropTypes.node,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string
};

export default Card;