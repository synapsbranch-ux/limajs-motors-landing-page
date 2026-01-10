// src/components/ui/Counter.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useInView } from 'framer-motion';

const Counter = ({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  easing = 'easeOut',
  separator = ',',
  className = '',
  valueClassName = '',
  labelClassName = '',
  label,
  icon: Icon,
  animate = true,
}) => {
  const [count, setCount] = useState(animate ? start : end);
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Formatage du nombre
  const formatNumber = (num) => {
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).replace(/,/g, separator);
  };

  // Animation du compteur
  useEffect(() => {
    if (!animate || !isInView || hasAnimated) return;
    
    let startTime;
    let animationFrame;
    const totalDuration = duration * 1000; // convertir en ms
    
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Calculer la progression selon la courbe d'accélération choisie
      let progress;
      switch (easing) {
        case 'linear':
          progress = elapsed / totalDuration;
          break;
        case 'easeIn':
          progress = Math.pow(elapsed / totalDuration, 2);
          break;
        case 'easeOut':
          progress = 1 - Math.pow(1 - elapsed / totalDuration, 2);
          break;
        case 'easeInOut':
          progress = elapsed / totalDuration < 0.5
            ? 2 * Math.pow(elapsed / totalDuration, 2)
            : 1 - Math.pow(-2 * (elapsed / totalDuration) + 2, 2) / 2;
          break;
        default:
          progress = elapsed / totalDuration;
      }
      
      // Limiter la progression à 1
      progress = Math.min(progress, 1);
      
      // Calculer la valeur actuelle
      const currentCount = start + (end - start) * progress;
      
      // Arrondir selon le nombre de décimales
      const roundedCount = Number(currentCount.toFixed(decimals));
      
      setCount(roundedCount);
      
      // Continuer l'animation si non terminée
      if (elapsed < totalDuration) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(end);
        setHasAnimated(true);
      }
    };
    
    // Démarrer l'animation après le délai
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(step);
    }, delay * 1000);
    
    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animate, start, end, duration, delay, decimals, easing, isInView, hasAnimated]);

  return (
    <div className={`text-center ${className}`} ref={countRef}>
      {Icon && (
        <div className="mb-4 mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
          <Icon className="text-primary h-8 w-8" />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: delay }}
        className={`text-3xl md:text-4xl font-bold mb-2 ${valueClassName}`}
      >
        {prefix}{formatNumber(count)}{suffix}
      </motion.div>
      
      {label && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className={`text-gray-600 dark:text-gray-300 ${labelClassName}`}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
};

Counter.propTypes = {
  end: PropTypes.number.isRequired,
  start: PropTypes.number,
  duration: PropTypes.number,
  delay: PropTypes.number,
  decimals: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  easing: PropTypes.oneOf(['linear', 'easeIn', 'easeOut', 'easeInOut']),
  separator: PropTypes.string,
  className: PropTypes.string,
  valueClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  label: PropTypes.node,
  icon: PropTypes.elementType,
  animate: PropTypes.bool,
};

export default Counter;