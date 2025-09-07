
import React, { useState } from 'react';
import PhotoIcon from './icons/PhotoIcon';

interface ImageUploaderProps {
  label: string;
  onFileChange: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onFileChange }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Must be an image file.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileChange(file);
    }
  };
  
  const fileInputId = `file-upload-${label.replace(/\s+/g, '-')}`;

  return (
    <div className="aspect-square">
        <label htmlFor={fileInputId} className="relative cursor-pointer group h-full">
            <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-[var(--color-text-dim)] group-hover:border-[var(--color-focus)] group-hover:text-[var(--color-text)] transition-colors overflow-hidden ${imagePreview ? 'border-2 border-gray-400 dark:border-gray-700' : 'border-2 border-gray-400 dark:border-gray-600 border-dashed'}`}>
                {imagePreview ? (
                    <img src={imagePreview} alt={`${label} preview`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                    <div className="text-center p-2">
                        <PhotoIcon className="mx-auto h-8 w-8" />
                        <span className="mt-2 block text-xs font-semibold">Click to upload</span>
                        <p className="text-[10px] text-gray-500">{label}</p>
                    </div>
                )}
            </div>
            <input id={fileInputId} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
        </label>
        {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploader;
