
export interface Scenario {
  name: string;
  prompt: string;
  emoji: string;
}

export const DEMO_SCENARIOS: Scenario[] = [
  { name: 'Medieval Battle', prompt: 'in a medieval fantasy battle, cinematic lighting, epic scale', emoji: '⚔️' },
  { name: 'Coffee Shop', prompt: 'in a modern, cozy coffee shop, relaxed pose, warm lighting', emoji: '☕' },
  { name: 'Space Station', prompt: 'inside a futuristic space station corridor, neon lights, heroic pose', emoji: '🚀' },
  { name: '1920s Jazz Club', prompt: 'in a smoky 1920s jazz club, dim lighting, elegant attire', emoji: '🎷' },
  { name: 'Underwater Scene', prompt: 'in a vibrant underwater scene with coral reefs and fish, serene expression', emoji: '🐠' },
  { name: 'Comic Book Style', prompt: 'as a comic book character, cel-shaded, dynamic action pose, speech bubble saying "Wow!"', emoji: '💥' },
  { name: 'Cyberpunk City', prompt: 'in a neon-lit cyberpunk city at night, rain-slicked streets, dramatic pose', emoji: '🌃' },
  { name: 'Mountain Summit', prompt: 'on a mountain summit at sunset, looking out at the view, confident stance', emoji: '🏔️' },
];
