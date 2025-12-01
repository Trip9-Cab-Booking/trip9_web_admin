import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
  <label {...props} className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);

export default Label;
