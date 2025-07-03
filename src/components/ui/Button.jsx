// Reusable button component
import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
