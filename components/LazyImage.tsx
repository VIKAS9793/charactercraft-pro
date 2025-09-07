import React, { useState, useEffect, useRef } from 'react';
import PhotoIcon from './icons/PhotoIcon';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  placeholderClassName = 'w-full h-full flex items-center justify-center', 
  className, 
  alt, 
  ...props 
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    const currentRef = containerRef.current;

    if (currentRef) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Disconnect after it's in view once.
          }
        },
        {
          rootMargin: '0px 0px 300px 0px', // Load images 300px before they enter viewport.
          threshold: 0.01,
        }
      );
      observer.observe(currentRef);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {isInView && (
        <img
          src={src}
          className={`${className} transition-opacity duration-500 ease-in-out ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
          alt={alt}
          onLoad={() => setHasLoaded(true)}
          {...props}
        />
      )}

      {!hasLoaded && (
        <div className={`absolute inset-0 ${placeholderClassName}`}>
          <PhotoIcon className="w-10 h-10 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default LazyImage;
