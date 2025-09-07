// services/variationService.ts

/**
 * A utility function to shuffle an array in place.
 * Uses the Fisher-Yates (aka Knuth) Shuffle algorithm.
 * @param array The array to shuffle.
 */
const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

/**
 * A utility to pick a specified number of unique random elements from an array.
 * @param arr The array to pick from.
 * @param num The number of unique elements to pick.
 * @returns An array of unique elements.
 */
const pickRandomUnique = <T>(arr: T[], num: number): T[] => {
  return shuffle([...arr]).slice(0, num);
}

const VARIATION_DIMENSIONS = {
    environmental: [
        "in golden hour lighting", "with dramatic, controlled studio lighting", 
        "on an overcast day with soft, diffused light", "in a neon-lit urban environment at night",
        "under a harsh desert sun with strong shadows", "on a misty forest morning with ethereal light",
        "during a vibrant sunset", "in a moody, rain-slicked setting", "under the soft glow of twilight"
    ],
    compositional: [
        "as a close-up portrait with a shallow depth of field", "as a wide-angle environmental shot showing the full context",
        "from a low-angle hero shot, looking powerful", "from a high-angle bird's eye perspective",
        "with a dutch angle for a dynamic feel", "in a perfectly symmetrical and centered composition",
        "framed through a window or doorway", "using the rule of thirds", "as a cinematic wide shot"
    ],
    stylistic: [
        "in a photorealistic style with a film photography aesthetic", "in a clean, modern digital art illustration style",
        "with the texture and feel of a classical oil painting", "in a comic book style with bold colors and ink lines",
        "in a high-contrast, noir black and white style", "with the soft, flowing aesthetic of a watercolor painting",
        "in a vibrant, synthwave art style", "as a piece of minimalist vector art", "in a gritty, textured, grunge style"
    ],
};

type Dimension = keyof typeof VARIATION_DIMENSIONS;

/**
 * Generates a set of diverse and creative prompts based on a single base prompt.
 * @param basePrompt The user's initial prompt.
 * @param count The number of unique variations to generate.
 * @returns An array of uniquely crafted, detailed prompts.
 */
export const generateDiversePrompts = (basePrompt: string, count: number): string[] => {
    if (count <= 1) {
        return [basePrompt];
    }

    const prompts: string[] = [];
    const usedModifiers = new Set<string>();

    const getUniqueModifier = (dimension: Dimension): string => {
        const modifiers = VARIATION_DIMENSIONS[dimension];
        let modifier;
        let attempts = 0;
        do {
            modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            attempts++;
        } while (usedModifiers.has(modifier) && attempts < modifiers.length * 2); // Prevent infinite loops
        usedModifiers.add(modifier);
        return modifier;
    };
    
    // Create a pool of dimensions to ensure we try different ones
    const dimensionPool: Dimension[] = [];
    for (let i = 0; i < count; i++) {
        dimensionPool.push('environmental');
        dimensionPool.push('compositional');
        dimensionPool.push('stylistic');
    }
    shuffle(dimensionPool);


    for (let i = 0; i < count; i++) {
        const d1 = dimensionPool.pop() || 'compositional';
        const d2 = dimensionPool.pop() || 'stylistic';

        const modifier1 = getUniqueModifier(d1);
        const modifier2 = getUniqueModifier(d2);

        // Combine them into a new, more descriptive prompt
        const newPrompt = `${basePrompt}, ${modifier1}, ${modifier2}.`;
        prompts.push(newPrompt);
    }

    return prompts;
};
