import React, { useState, useCallback } from 'react';
import { AppState, GeneratedImage } from './types';
import UploadStep from './components/UploadStep';
import StudioStep from './components/StudioStep';
import { ImagePart, generateConsistentCharacter } from './services/geminiService';
import { generateDiversePrompts } from './services/variationService';
import { processPromisesInChunks } from './services/asyncUtils';
import SettingsPanel from './components/SettingsPanel';
import ConfirmationDialog from './components/ConfirmationDialog';


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [characterName, setCharacterName] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<ImagePart | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleStart = useCallback((name: string, imageBase64: string, mimeType: string) => {
    setCharacterName(name);
    setReferenceImage({ base64: imageBase64, mimeType });
    setAppState(AppState.STUDIO);
  }, []);

  const handleRequestReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setAppState(AppState.UPLOAD);
    setCharacterName('');
    setReferenceImage(null);
    setGeneratedImages([]);
    setIsLoading(false);
    setGeneratingCount(0);
    setCompletedCount(0);
    setError(null);
    setShowResetConfirm(false);
  };

  const handleCreativeGenerate = useCallback(async (
    basePrompt: string,
    textOverlay: string,
    count: number,
    intelligentVariations: boolean
  ) => {
    if (!referenceImage) return;

    setIsLoading(true);
    setError(null);
    setGeneratingCount(count);
    setCompletedCount(0);
    const batchId = Date.now().toString();

    const textPromptPart = textOverlay ? ` with the text "${textOverlay}" written on it` : '';
    
    const prompts = intelligentVariations 
      ? generateDiversePrompts(basePrompt, count)
      : Array(count).fill(basePrompt);
      
    const promiseFactories = prompts.map(prompt => () => {
      const fullPromptForAPI = `Place the character "${characterName}" from the reference image into a new scene described as: ${prompt}.${textPromptPart}`;
      return generateConsistentCharacter([referenceImage], fullPromptForAPI);
    });

    const results = await processPromisesInChunks(promiseFactories, 2, (completed, total) => {
      setCompletedCount(completed);
    });

    const newImages: GeneratedImage[] = [];
    results.forEach((result, index) => {
      const id = `${batchId}-${index}`;
      if (result.status === 'fulfilled') {
        const { image: newImageBase64, text } = result.value;
        newImages.push({
          id,
          batchId,
          src: `data:image/png;base64,${newImageBase64}`,
          basePrompt,
          textOverlay,
          fullPromptForCopy: `${characterName} ${prompts[index]}${textPromptPart}`,
          text,
          sourceImages: [ `data:${referenceImage.mimeType};base64,${referenceImage.base64}` ],
        });
      } else {
        console.error('Generation failed for one of the images:', result.reason);
        newImages.push({
            id,
            batchId,
            src: '',
            basePrompt: prompts[index],
            textOverlay,
            fullPromptForCopy: `${characterName} ${prompts[index]}${textPromptPart}`,
            error: result.reason instanceof Error ? result.reason.message : 'An unknown error occurred.',
            sourceImages: [ `data:${referenceImage.mimeType};base64,${referenceImage.base64}` ],
        });
      }
    });

    setGeneratedImages(prev => [...newImages, ...prev]);
    setIsLoading(false);
  }, [referenceImage, characterName]);
  
  const handleFusionGenerate = useCallback(async (
    basePrompt: string,
    images: ImagePart[],
    count: number
  ) => {
    if (images.length < 2) return;
    setIsLoading(true);
    setError(null);
    setGeneratingCount(count);
    setCompletedCount(0);
    const batchId = Date.now().toString();

    const promiseFactories = Array(count).fill(0).map(() => () => {
      const fullPromptForAPI = `Take the character from the first image. Fuse them into a new scene with the following theme: "${basePrompt}". Use the other images provided as strong references for the background, style, and lighting.`;
      return generateConsistentCharacter(images, fullPromptForAPI);
    });

    const results = await processPromisesInChunks(promiseFactories, 2, (completed, total) => {
      setCompletedCount(completed);
    });

    const newImages: GeneratedImage[] = [];
    results.forEach((result, index) => {
        const id = `${batchId}-${index}`;
        if (result.status === 'fulfilled') {
            const { image: newImageBase64, text } = result.value;
            newImages.push({
                id,
                batchId,
                src: `data:image/png;base64,${newImageBase64}`,
                basePrompt,
                textOverlay: '',
                fullPromptForCopy: `${basePrompt}. Fused from ${images.length} images.`,
                text,
                sourceImages: images.map(img => `data:${img.mimeType};base64,${img.base64}`)
            });
        } else {
            console.error('Fusion failed for one of the images:', result.reason);
            newImages.push({
                id,
                batchId,
                src: '',
                basePrompt,
                textOverlay: '',
                fullPromptForCopy: `${basePrompt}. Fused from ${images.length} images.`,
                error: result.reason instanceof Error ? result.reason.message : 'An unknown error occurred.',
                sourceImages: images.map(img => `data:${img.mimeType};base64,${img.base64}`)
            });
        }
    });

    setGeneratedImages(prev => [...newImages, ...prev]);
    setIsLoading(false);

  }, []);

  return (
    <>
      <SettingsPanel />
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {appState === AppState.UPLOAD && <UploadStep onStart={handleStart} />}
        {appState === AppState.STUDIO && referenceImage && (
          <StudioStep
            characterName={characterName}
            referenceImage={referenceImage}
            generatedImages={generatedImages}
            onCreativeGenerate={handleCreativeGenerate}
            onFusionGenerate={handleFusionGenerate}
            isLoading={isLoading}
            generatingCount={generatingCount}
            completedCount={completedCount}
            onReset={handleRequestReset}
          />
        )}
      </main>
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="Are you sure?"
      >
        All generated images will be lost and you will return to the upload screen. This action cannot be undone.
      </ConfirmationDialog>
    </>
  );
};

export default App;