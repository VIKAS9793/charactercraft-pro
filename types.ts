export enum AppState {
  UPLOAD,
  STUDIO,
}

export interface GeneratedImage {
  id: string;
  batchId: string;
  src: string;
  basePrompt: string;
  textOverlay: string;
  fullPromptForCopy: string;
  text?: string;
  sourceImages?: string[]; // Store previews of source images for fusion
  error?: string;
}