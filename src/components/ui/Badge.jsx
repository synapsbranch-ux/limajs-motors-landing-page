// src/components/ui/Badge.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  className = '',
  pill = false
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium";
  
  const variants = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    accent: "bg-accent/10 text-accent-dark",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} className="mr-1" />}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'gray', 'accent']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.elementType,
  className: PropTypes.string,
  pill: PropTypes.bool
};

export default Badge;