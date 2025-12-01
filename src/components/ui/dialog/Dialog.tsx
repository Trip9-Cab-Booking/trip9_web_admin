'use client';
import React from 'react';

export const Dialog: React.FC<{ open: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }> = ({ open, children }) => {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">{children}</div>;
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={`bg-white rounded-lg shadow-lg w-full ${className}`}>{children}</div>
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={`px-6 py-4 border-b ${className}`}>{children}</div>
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h2 {...props} className={`text-lg font-semibold ${className}`}>{children}</h2>
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div {...props} className={`px-6 py-4 border-t flex justify-end gap-2 ${className}`}>{children}</div>
);

export default Dialog;
