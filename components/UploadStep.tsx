import React, { useState, useCallback, DragEvent } from 'react';
import { fileToBase64 } from '../services/geminiService';
import MagicWandIcon from './icons/MagicWandIcon';

interface UploadStepProps {
  onStart: (name: string, image: string, mimeType: string) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onStart }) => {
  const [characterName, setCharacterName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!characterName || !imageFile) {
      setError('Please provide a character name and upload an image.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const base64Image = await fileToBase64(imageFile);
      onStart(characterName, base64Image, imageFile.type);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-[var(--color-surface)] rounded-xl p-8 backdrop-blur-md border border-[var(--color-border)] shadow-2xl shadow-black/10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[var(--color-text)] font-display">🎭 Welcome to CharacterCraft Pro</h2>
          <p className="mt-3 text-lg text-[var(--color-text-dim)]">
            The AI studio that maintains <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]">PERFECT</span> character consistency.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Let's get to know your character.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="character-name" className="block text-sm font-medium text-[var(--color-text-dim)] mb-2">
              1. Give your character a name
            </label>
            <input
              type="text"
              id="character-name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="e.g., 'Captain Eva' or 'A friendly robot mascot'"
              className="mt-1 block w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:border-[var(--color-focus)] sm:text-sm transition shadow-inner shadow-black/5"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-[var(--color-text-dim)] mb-2">
              2. Upload a reference image
            </label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative mt-1 flex justify-center p-6 border-2 border-dashed rounded-lg transition-all duration-300 ${isDragging ? 'border-[var(--color-focus)] bg-teal-500/10 scale-105' : 'border-gray-400 dark:border-gray-600 hover:border-gray-500'}`}
            >
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Character preview" className="mx-auto h-32 w-32 object-cover rounded-full shadow-lg border-2 border-gray-300 dark:border-gray-700" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-500 dark:text-gray-400 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-bg)] focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, WEBP, etc.</p>
              </div>
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500 dark:text-red-400 text-center animate-fade-in">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!characterName || !imageFile || isProcessing}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-[var(--color-accent-cta)] to-[var(--color-accent-secondary)] hover:from-[var(--color-accent-cta-hover)] hover:to-[var(--color-accent-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] focus:ring-[var(--color-accent-cta)] disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:from-gray-400 dark:disabled:from-gray-600 disabled:to-gray-500 dark:disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 ease-in-out transform hover:scale-[1.03] active:scale-[1.00] font-display"
            >
              <MagicWandIcon className="w-6 h-6" />
              {isProcessing ? 'Processing...' : 'Start Crafting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadStep;