// src/components/ui/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  type = 'button',
  onClick,
  icon: Icon,
  className = '',
  fullWidth = false,
  as = 'button',
  href,
  target,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark focus:ring-primary text-white shadow-button hover:shadow-lg",
    secondary: "bg-secondary hover:bg-secondary-dark focus:ring-secondary text-white",
    outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
    ghost: "text-primary hover:bg-primary/10 focus:ring-primary"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  // Créer un élément différent selon le prop "as"
  const Component = as === 'button' ? motion.button : motion[as] || motion.a;

  return (
    <Component
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      type={as === 'button' ? type : undefined}
      onClick={onClick}
      disabled={disabled || isLoading}
      href={href}
      target={target}
      className={buttonClasses}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader className="animate-spin mr-2" size={20} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={children ? "mr-2" : ""} size={20} />}
          {children}
        </>
      )}
    </Component>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  as: PropTypes.oneOf(['button', 'a', 'div', 'span']),
  href: PropTypes.string,
  target: PropTypes.string
};

export default Button;