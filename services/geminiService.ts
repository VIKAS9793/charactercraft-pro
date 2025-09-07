import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * An interface representing a single image part for the API request.
 */
export interface ImagePart {
  base64: string;
  mimeType: string;
}

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is in format "data:image/jpeg;base64,..."
      // We only want the part after the comma
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates a new image based on one or more reference images and a text prompt.
 * This is used for both single-character generation and multi-image fusion.
 * @param imageParts An array of base64 encoded reference images with their MIME types.
 * @param prompt The text prompt describing the desired output.
 * @returns A promise that resolves with the new base64 image and any accompanying text.
 */
// FIX: Removed systemInstruction parameter and unsupported config options (temperature) to align with Gemini API guidelines for the 'gemini-2.5-flash-image-preview' model.
export const generateConsistentCharacter = async (
  imageParts: ImagePart[],
  prompt: string
): Promise<{ image: string; text?: string }> => {
  try {
    const contentParts = [
      ...imageParts.map(part => ({
        inlineData: {
          data: part.base64,
          mimeType: part.mimeType,
        },
      })),
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: contentParts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    if (!response.candidates || response.candidates.length === 0) {
      const promptFeedback = response.promptFeedback;
      if (promptFeedback && promptFeedback.blockReason) {
        throw new Error(`Request was blocked. Reason: ${promptFeedback.blockReason}. ${promptFeedback.blockReasonMessage || ''}`);
      }
      throw new Error('No candidates returned from the API. The request might have been blocked.');
    }

    const candidate = response.candidates[0];
    const parts = candidate.content.parts;
    let newImageBase64: string | null = null;
    let newText: string | undefined;

    for (const part of parts) {
      if (part.inlineData) {
        newImageBase64 = part.inlineData.data;
      } else if (part.text) {
        newText = part.text;
      }
    }
    
    if (!newImageBase64) {
      // The API returned a response, but it didn't contain an image.
      // This often happens due to safety filters or if the model can't fulfill the request.
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
         throw new Error(`API response did not contain an image. Generation failed with reason: '${candidate.finishReason}'. This is often due to safety settings or an unsupported prompt.`);
      }
      throw new Error('API response did not contain an image. It might have been blocked due to safety settings or an issue with the prompt.');
    }
    
    return { image: newImageBase64, text: newText };
  } catch (error) {
    console.error('Gemini API call failed:', error);
    if (error instanceof Error) {
        // Prevent generic wrapper message if a specific one was thrown
        if (error.message.startsWith('API response') || error.message.startsWith('Request was blocked') || error.message.startsWith('No candidates')) {
          throw error;
        }
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('Failed to generate image. An unknown error occurred.');
  }
};
