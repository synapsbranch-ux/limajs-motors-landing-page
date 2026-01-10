// src/components/ui/Timeline.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const TimelineItem = ({
  date,
  title,
  description,
  icon: Icon,
  image,
  index,
  isLast,
  align = 'left',
  className = '',
}) => {
  // Animation pour les items de la timeline
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: align === 'left' ? -20 : align === 'right' ? 20 : 0 
    },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: { 
        delay: i * 0.2,
        duration: 0.5,
      }
    })
  };

  return (
    <div className={`relative ${className}`}>
      {/* Ligne verticale */}
      {!isLast && (
        <div className={`absolute ${align === 'right' ? 'left-0' : align === 'left' ? 'right-0' : 'left-1/2 -translate-x-1/2'} top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700`}></div>
      )}
      
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={variants}
        custom={index}
        className={`relative ${align === 'alternate' ? (index % 2 === 0 ? 'md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0') : ''} z-10`}
      >
        <div className={`flex ${align === 'alternate' && index % 2 !== 0 ? 'md:flex-row-reverse' : ''} items-center`}>
          {/* Point et icône */}
          <div className={`flex-shrink-0 ${align === 'right' ? 'order-last ml-4' : 'mr-4'}`}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-gray-900">
              {Icon ? <Icon className="w-5 h-5 text-primary" /> : 
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              }
            </div>
          </div>
          
          {/* Contenu */}
          <div className={`bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${align === 'alternate' ? 'md:w-[calc(50%-2.5rem)]' : 'max-w-md'}`}>
            {date && (
              <div className="text-sm font-medium text-primary mb-1">
                {date}
              </div>
            )}
            
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              {title}
            </h3>
            
            {description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {description}
              </p>
            )}
            
            {image && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

TimelineItem.propTypes = {
  date: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  icon: PropTypes.elementType,
  image: PropTypes.string,
  index: PropTypes.number.isRequired,
  isLast: PropTypes.bool.isRequired,
  align: PropTypes.oneOf(['left', 'right', 'alternate']),
  className: PropTypes.string,
};

const Timeline = ({
  items,
  align = 'left',
  className = '',
}) => {
  return (
    <div className={`py-4 ${className}`}>
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          {...item}
          index={index}
          isLast={index === items.length - 1}
          align={align}
          className={index === items.length - 1 ? '' : 'mb-8'}
        />
      ))}
    </div>
  );
};

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.node,
      title: PropTypes.node.isRequired,
      description: PropTypes.node,
      icon: PropTypes.elementType,
      image: PropTypes.string,
    })
  ).isRequired,
  align: PropTypes.oneOf(['left', 'right', 'alternate']),
  className: PropTypes.string,
};

export default Timeline;