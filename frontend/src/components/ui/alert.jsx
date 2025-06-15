import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames'; // Optional, if you use `classnames` for managing classes

// Alert Component
export const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const alertClass = classNames(
    'alert',
    {
      'alert-default': variant === 'default',
      'alert-success': variant === 'success',
      'alert-warning': variant === 'warning',
      'alert-error': variant === 'error',
    },
    className
  );

  return (
    <div className={alertClass} {...props}>
      {children}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error']),
  className: PropTypes.string,
};

// AlertDescription Component
export const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`alert-description ${className}`} {...props}>
      {children}
    </p>
  );
};

AlertDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
