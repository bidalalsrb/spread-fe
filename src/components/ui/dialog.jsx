import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

function Dialog({ open, children }) {
  if (!open) {
    return null;
  }
  return createPortal(children, document.body);
}

function DialogOverlay({ className, ...props }) {
  return <div className={cn('fixed inset-0 z-50 bg-black/50', className)} {...props} />;
}

function DialogContent({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5', className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div className={cn('flex justify-end gap-2', className)} {...props} />;
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle };
