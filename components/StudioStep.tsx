

import React, { useState, useMemo } from 'react';
import { GeneratedImage } from '../types';
import { ImagePart, fileToBase64 } from '../services/geminiService';
import { DEMO_SCENARIOS } from '../constants';
import ImageCard from './ImageCard';
import RestartIcon from './icons/RestartIcon';
import SparklesIcon from './icons/SparklesIcon';
import MagicWandIcon from './icons/MagicWandIcon';
import ImageUploader from './ImageUploader';

interface StudioStepProps {
  characterName: string;
  referenceImage: ImagePart;
  generatedImages: GeneratedImage[];
  onCreativeGenerate: (basePrompt: string, textOverlay: string, count: number, intelligentVariations: boolean) => void;
  onFusionGenerate: (basePrompt: string, images: ImagePart[], count: number) => void;
  isLoading: boolean;
  generatingCount: number;
  completedCount: number;
  onReset: () => void;
}

type Mode = 'creative' | 'fusion';

const StudioStep: React.FC<StudioStepProps> = ({
  characterName,
  referenceImage,
  generatedImages,
  onCreativeGenerate,
  onFusionGenerate,
  isLoading,
  generatingCount,
  completedCount,
  onReset,
}) => {
  const [mode, setMode] = useState<Mode>('creative');
  const [basePrompt, setBasePrompt] = useState('');
  const [textOverlay, setTextOverlay] = useState('');
  const [count, setCount] = useState(4);
  
  const [fusionImages, setFusionImages] = useState<(ImagePart | null)[]>([null, null]);
  
  const handleFusionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allImages = [referenceImage, ...fusionImages.filter((img): img is ImagePart => img !== null)];
    if (allImages.length < 2) {
        alert("Please provide at least one additional image for fusion.");
        return;
    }
    onFusionGenerate(basePrompt, allImages, count);
  };

  const handleFusionFileChange = async (file: File, index: number) => {
    try {
        const base64 = await fileToBase64(file);
        const newImagePart: ImagePart = { base64, mimeType: file.type };
        setFusionImages(current => {
            const newImages = [...current];
            newImages[index] = newImagePart;
            return newImages;
        });
    } catch (error) {
        console.error("Error processing file for fusion:", error);
    }
  };

  const batches = useMemo(() => {
    const batched: { [key: string]: GeneratedImage[] } = {};
    generatedImages.forEach(image => {
      if (!batched[image.batchId]) {
        batched[image.batchId] = [];
      }
      batched[image.batchId].push(image);
    });
    return Object.entries(batched).sort(([a], [b]) => Number(b) - Number(a));
  }, [generatedImages]);

  const progress = generatingCount > 0 ? (completedCount / generatingCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 animate-fade-in">
      
      {/* Left Column: Controls */}
      <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-8 self-start space-y-6">
        {/* Character Header */}
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <img
                    src={`data:${referenceImage.mimeType};base64,${referenceImage.base64}`}
                    alt={characterName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-surface-light)] shadow-md"
                />
                <h1 className="text-xl font-bold text-[var(--color-text)] font-display truncate" title={characterName}>
                    {characterName}
                </h1>
            </div>
            <button
                onClick={onReset}
                className="flex items-center justify-center shrink-0 gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-xs font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)] hover:border-[var(--color-focus)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-all"
                title="Start Over"
            >
                <RestartIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Start Over</span>
            </button>
        </div>

        {/* Generator Panel */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-xl shadow-black/10">
          <div className="flex bg-[var(--color-surface-light)] rounded-lg p-1 mb-6">
              <button onClick={() => setMode('creative')} className={`flex-1 text-center px-2 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'creative' ? 'bg-[var(--color-surface)] shadow-md text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>
                  Creative
              </button>
              <button onClick={() => setMode('fusion')} className={`flex-1 text-center px-2 py-1.5 rounded-md text-sm font-semibold transition-all ${mode === 'fusion' ? 'bg-[var(--color-surface)] shadow-md text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>
                  Fusion
              </button>
          </div>

          {mode === 'creative' && (
               <form className="space-y-6">
                  <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-[var(--color-text-dim)] mb-2">
                          Scenario
                      </label>
                      <textarea
                          id="prompt"
                          rows={3}
                          value={basePrompt}
                          onChange={(e) => setBasePrompt(e.target.value)}
                          placeholder={`e.g., 'fighting a dragon'`}
                          className="block w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] sm:text-sm shadow-inner"
                          required
                      />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                      {DEMO_SCENARIOS.slice(0, 4).map(scenario => (
                          <button type="button" key={scenario.name} onClick={() => setBasePrompt(scenario.prompt)} className="px-3 py-1.5 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-dim)] hover:border-[var(--color-focus)] hover:text-[var(--color-text)] transition">
                              {scenario.emoji} {scenario.name}
                          </button>
                      ))}
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label htmlFor="text-overlay" className="block text-sm font-medium text-[var(--color-text-dim)] mb-2">Text Overlay (Optional)</label>
                          <input
                              type="text"
                              id="text-overlay"
                              value={textOverlay}
                              onChange={(e) => setTextOverlay(e.target.value)}
                              placeholder='e.g., "Wow!"'
                              className="block w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] sm:text-sm"
                          />
                      </div>
                  </div>
                  
                  <div className="pt-2 space-y-3">
                      <button
                          type="button"
                          onClick={() => onCreativeGenerate(basePrompt, textOverlay, 1, false)}
                          disabled={isLoading || !basePrompt}
                          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-[var(--color-accent-cta)] to-[var(--color-accent-secondary)] hover:from-[var(--color-accent-cta-hover)] hover:to-[var(--color-accent-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                          title="Generate a single, high-quality image."
                      >
                          <MagicWandIcon className="w-6 h-6" />
                          Generate
                      </button>
                      <div className="flex items-center gap-3">
                          <button
                              type="button"
                              onClick={() => onCreativeGenerate(basePrompt, textOverlay, 2, true)}
                              disabled={isLoading || !basePrompt}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-[var(--color-border)] rounded-lg text-sm font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              title="Generate 2 creative variations of the prompt."
                          >
                              <SparklesIcon className="w-4 h-4 text-[var(--color-accent-secondary)]" />
                              <span>Generate x2 <span className="hidden sm:inline">(Smart)</span></span>
                          </button>
                          <button
                              type="button"
                              onClick={() => onCreativeGenerate(basePrompt, textOverlay, 4, true)}
                              disabled={isLoading || !basePrompt}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-[var(--color-border)] rounded-lg text-sm font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              title="Generate 4 creative variations of the prompt."
                          >
                              <SparklesIcon className="w-4 h-4 text-[var(--color-accent-secondary)]" />
                              <span>Generate x4 <span className="hidden sm:inline">(Smart)</span></span>
                          </button>
                      </div>
                  </div>
              </form>
          )}
          
          {mode === 'fusion' && (
              <form onSubmit={handleFusionSubmit} className="space-y-6">
                  <div>
                      <label htmlFor="fusion-prompt" className="block text-sm font-medium text-[var(--color-text-dim)] mb-2">
                          Fusion Theme
                      </label>
                      <input
                          type="text" id="fusion-prompt" value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)}
                          placeholder={`e.g., '80s synthwave aesthetic'`}
                          className="block w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] sm:text-sm"
                          required
                      />
                  </div>
                  
                  <div className="space-y-4">
                      <p className="block text-sm font-medium text-[var(--color-text-dim)]">Fusion Sources</p>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                              <img src={`data:${referenceImage.mimeType};base64,${referenceImage.base64}`} alt="Reference" className="aspect-square w-full object-cover rounded-lg border-2 border-[var(--color-focus)]"/>
                              <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">Character</div>
                          </div>
                          {fusionImages.map((_, index) => (
                               <ImageUploader key={index} label={`Image ${index + 2}`} onFileChange={(file) => handleFusionFileChange(file, index)} />
                          ))}
                      </div>
                  </div>

                   <div>
                      <label htmlFor="fusion-count" className="block text-sm font-medium text-[var(--color-text-dim)] mb-2">Number of Images</label>
                      <input
                          type="number" id="fusion-count" min="1" max="8" value={count}
                          onChange={(e) => setCount(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] sm:text-sm"
                      />
                  </div>

                  <div className="pt-2">
                      <button type="submit" disabled={isLoading || !basePrompt || fusionImages.every(i => i === null)} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]">
                          Fuse Images
                      </button>
                  </div>
              </form>
          )}
        </div>
      </aside>

      {/* Right Column: Gallery */}
      <main className="lg:col-span-8 xl:col-span-9">
          {isLoading && (
              <div className="mb-6">
                  <div className="w-full bg-[var(--color-surface-light)] rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-[var(--color-accent-cta)] to-[var(--color-accent-secondary)] h-2.5 rounded-full transition-all duration-500" 
                        style={{width: `${progress}%`}}
                      ></div>
                  </div>
                  <p className="text-center text-sm text-[var(--color-text-dim)] mt-2">
                    Generating... {completedCount} of {generatingCount} images complete.
                  </p>
              </div>
          )}

          <div className="space-y-8">
            {batches.length === 0 && !isLoading && (
                <div className="text-center py-16 lg:py-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">Your creations will appear here</h3>
                    <p className="text-[var(--color-text-dim)] mt-2">Use the controls on the left to generate images.</p>
                </div>
            )}
            {batches.map(([batchId, images]) => (
              <div key={batchId}>
                <h2 className="text-2xl font-bold mb-4 font-display text-[var(--color-text)]">Generation Batch</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {images.map(image => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                  {isLoading && batchId === batches[0][0] && Array.from({ length: generatingCount - completedCount }).map((_, i) => (
                    <ImageCard key={`loading-${i}`} isLoading />
                  ))}
                </div>
              </div>
            ))}
          </div>
      </main>
    </div>
  );
};

export default StudioStep;