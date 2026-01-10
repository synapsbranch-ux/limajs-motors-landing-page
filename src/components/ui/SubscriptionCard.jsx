// src/components/ui/SubscriptionCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

// Importations des composants
import Button from './Button';
import Badge from './Badge';

const SubscriptionCard = ({
  title,
  price,
  period = 'mois',
  currency = 'HTG',
  description,
  features = [],
  notIncluded = [],
  callToAction = 'Souscrire',
  callToActionProps = {},
  onSubscribe,
  popular = false,
  className = '',
  priceClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  icon: Icon,
}) => {
  // Animation au survol
  const hoverAnimation = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.03, y: -5 },
  };

  // Formater le prix
  const formattedPrice = typeof price === 'number' 
    ? new Intl.NumberFormat('fr-FR').format(price)
    : price;

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={hoverAnimation}
      transition={{ duration: 0.3 }}
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden
        shadow-lg border border-gray-100 dark:border-gray-700
        ${popular ? 'ring-2 ring-primary' : ''}
        ${className}
      `}
    >
      {/* Badge "Populaire" si applicable */}
      {popular && (
        <div className="absolute top-0 right-0 mt-4 mr-4 z-10">
          <Badge variant="primary" size="md" pill>
            Populaire
          </Badge>
        </div>
      )}

      {/* En-tête avec titre et prix */}
      <div className={`p-6 ${popular ? 'bg-primary/5' : 'bg-gray-50 dark:bg-gray-800'} ${headerClassName}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {description}
            </p>
          </div>
          {Icon && (
            <div className="bg-primary/10 p-3 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Corps avec prix et fonctionnalités */}
      <div className={`p-6 ${bodyClassName}`}>
        <div className={`flex items-baseline mb-6 ${priceClassName}`}>
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {currency} {formattedPrice}
          </span>
          {period && (
            <span className="ml-2 text-gray-500 dark:text-gray-400">/{period}</span>
          )}
        </div>

        {/* Liste des fonctionnalités incluses */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-300">{feature}</span>
            </li>
          ))}
          
          {/* Liste des fonctionnalités non incluses */}
          {notIncluded.map((feature, index) => (
            <li key={`not-${index}`} className="flex items-start opacity-75">
              <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-500 dark:text-gray-400 line-through">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pied avec bouton d'action */}
      <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 ${footerClassName}`}>
        <Button
          variant={popular ? 'primary' : 'outline'}
          fullWidth
          onClick={onSubscribe}
          {...callToActionProps}
        >
          {callToAction}
        </Button>
      </div>
    </motion.div>
  );
};

SubscriptionCard.propTypes = {
  title: PropTypes.node.isRequired,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  period: PropTypes.string,
  currency: PropTypes.string,
  description: PropTypes.node,
  features: PropTypes.arrayOf(PropTypes.node),
  notIncluded: PropTypes.arrayOf(PropTypes.node),
  callToAction: PropTypes.node,
  callToActionProps: PropTypes.object,
  onSubscribe: PropTypes.func,
  popular: PropTypes.bool,
  className: PropTypes.string,
  priceClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  icon: PropTypes.elementType,
};

export default SubscriptionCard;