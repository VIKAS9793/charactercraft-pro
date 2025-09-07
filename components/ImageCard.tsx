import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import LazyImage from './LazyImage';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import CopyIcon from './icons/CopyIcon';
import RefineIcon from './icons/RefineIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface ImageCardProps {
  image?: GeneratedImage;
  isLoading?: boolean;
  isRefining?: boolean;
  onRefine?: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, isLoading = false, isRefining, onRefine }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="aspect-square w-full rounded-xl bg-[var(--color-surface-light)] flex items-center justify-center border border-[var(--color-border)]">
        <SpinnerIcon />
      </div>
    );
  }

  if (!image) {
    return null;
  }
  
  if (image.error) {
    return (
        <div className="aspect-square w-full rounded-xl bg-red-500/10 flex flex-col items-center justify-center p-4 border border-red-500/30 text-center">
            <AlertTriangleIcon className="w-10 h-10 text-red-400 mb-2" />
            <h4 className="font-semibold text-red-400">Generation Failed</h4>
            <p className="text-xs text-red-400/80 mt-1" title={image.error}>{image.error}</p>
        </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(image.fullPromptForCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `${image.basePrompt.slice(0, 20).replace(/\s/g, '_')}-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleRefineClick = () => {
    if (onRefine) {
        onRefine(image.id);
    }
  }

  return (
    <div className={`relative group aspect-square w-full rounded-xl overflow-hidden shadow-lg shadow-black/10 border ${isRefining ? 'border-[var(--color-focus)] ring-2 ring-[var(--color-focus)]' : 'border-[var(--color-border)]'}`}>
      <LazyImage
        src={image.src}
        alt={image.basePrompt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Overlay for actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white text-xs font-mono mb-2 line-clamp-3" title={image.fullPromptForCopy}>
          {image.basePrompt}{image.textOverlay && ` with text "${image.textOverlay}"`}
        </p>
        <div className="flex items-center gap-2">
            {onRefine && (
              <button onClick={handleRefineClick} className="flex-1 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <RefineIcon className="w-4 h-4" /> Refine
              </button>
            )}
          <button onClick={handleCopy} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-colors" title="Copy Full Prompt">
            {isCopied ? <span className="text-xs">Copied!</span> : <CopyIcon className="w-4 h-4" />}
          </button>
          <button onClick={handleDownload} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-colors" title="Download Image">
            <DownloadIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;