import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';
type IconShape = 'rounded' | 'squared' | 'sharp';
type Motion = 'on' | 'off' | 'system';

interface PersonalizationContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  
  iconShape: IconShape;
  setIconShape: (shape: IconShape) => void;

  motion: Motion;
  setMotion: (motion: Motion) => void;
}

const ThemeContext = createContext<PersonalizationContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [iconShape, setIconShapeState] = useState<IconShape>('rounded');
  const [motion, setMotionState] = useState<Motion>('system');

  // Load settings from localStorage on initial render
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) setThemeState(storedTheme);
    
    const storedIconShape = localStorage.getItem('iconShape') as IconShape | null;
    if (storedIconShape) setIconShapeState(storedIconShape);
    
    const storedMotion = localStorage.getItem('motion') as Motion | null;
    if (storedMotion) setMotionState(storedMotion);
  }, []);

  // Handle theme changes
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
  }, [theme]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Handle icon shape changes
  const setIconShape = (newShape: IconShape) => {
    localStorage.setItem('iconShape', newShape);
    setIconShapeState(newShape);
  };
  
  useEffect(() => {
    document.documentElement.dataset.iconShape = iconShape;
  }, [iconShape]);
  
  // Handle motion changes
  const setMotion = (newMotion: Motion) => {
    localStorage.setItem('motion', newMotion);
    setMotionState(newMotion);
  };
  
  useEffect(() => {
      if (motion === 'system') {
        // Remove the attribute to let the browser's media query take over
        delete document.documentElement.dataset.motion;
      } else {
        document.documentElement.dataset.motion = motion;
      }
  }, [motion]);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
     const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return isDark ? 'dark' : 'light';
  }, [theme]);
  
  const value = { theme, setTheme, resolvedTheme, iconShape, setIconShape, motion, setMotion };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
