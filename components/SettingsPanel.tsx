import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SettingsIcon from './icons/SettingsIcon';

const SettingsPanel: React.FC = () => {
  const { theme, setTheme, iconShape, setIconShape, motion, setMotion } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const iconShapeOptions: { value: typeof iconShape, label: string }[] = [
      { value: 'rounded', label: 'Rounded' },
      { value: 'squared', label: 'Squared' },
      { value: 'sharp', label: 'Sharp' },
  ];
  
  const motionOptions: { value: typeof motion, label: string }[] = [
      { value: 'on', label: 'On' },
      { value: 'off', label: 'Off' },
      { value: 'system', label: 'System' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative" ref={panelRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="p-2 rounded-[var(--icon-border-radius)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:border-[var(--color-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] transition-all"
        >
            <SettingsIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        <div 
            className={`absolute top-full right-0 mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl shadow-black/20 p-2 transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
            role="menu"
            aria-orientation="vertical"
        >
            <div className="space-y-3">
                <div>
                    <p className="px-2 py-1 text-xs font-semibold text-[var(--color-text-dim)]">Theme</p>
                    <div className="flex bg-[var(--color-surface-light)] rounded-md p-1">
                        <button onClick={() => setTheme('light')} className={`flex-1 text-center px-2 py-1 rounded text-sm ${theme === 'light' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>Light</button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 text-center px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>Dark</button>
                        <button onClick={() => setTheme('system')} className={`flex-1 text-center px-2 py-1 rounded text-sm ${theme === 'system' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>System</button>
                    </div>
                </div>
                 <div>
                    <p className="px-2 py-1 text-xs font-semibold text-[var(--color-text-dim)]">Icon Shape</p>
                    <div className="flex bg-[var(--color-surface-light)] rounded-md p-1">
                        {iconShapeOptions.map(opt => (
                            <button key={opt.value} onClick={() => setIconShape(opt.value)} className={`flex-1 text-center px-2 py-1 rounded text-sm ${iconShape === opt.value ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>{opt.label}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="px-2 py-1 text-xs font-semibold text-[var(--color-text-dim)]">Motion</p>
                    <div className="flex bg-[var(--color-surface-light)] rounded-md p-1">
                        {motionOptions.map(opt => (
                            <button key={opt.value} onClick={() => setMotion(opt.value)} className={`flex-1 text-center px-2 py-1 rounded text-sm ${motion === opt.value ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>{opt.label}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
