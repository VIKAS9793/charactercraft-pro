import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import CloseIcon from './icons/CloseIcon';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      dialogRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm dialog-backdrop" onClick={onClose} />
      
      <div 
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl p-6 border border-[var(--color-border)] dialog-panel focus:outline-none"
      >
        <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-1 rounded-full text-[var(--color-text-dim)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text)] transition-colors">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangleIcon className="h-6 w-6 text-[var(--color-accent-danger)]" />
            </div>
            <div className="flex-1">
                <h3 id="dialog-title" className="text-lg font-bold font-display text-[var(--color-text)]">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-[var(--color-text-dim)]">{children}</p>
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)] text-[var(--color-text)] transition-colors"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-semibold text-white border border-transparent rounded-lg bg-[var(--color-accent-danger)] hover:bg-[var(--color-accent-danger-hover)] transition-colors"
            >
                Confirm
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationDialog;
