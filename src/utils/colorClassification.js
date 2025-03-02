/**
 * Comprehensive color classification system
 * Groups similar colors into standard categories for consistency
 */

// Main color groups with all their variations
const COLOR_GROUPS = {
  red: [
    'red', 'crimson', 'scarlet', 'ruby', 'cherry', 'maroon', 'burgundy', 
    'wine', 'carmine', 'cardinal', 'vermilion', 'rust', 'auburn', 'blood',
    'brick', 'tomato', 'raspberry', 'cranberry'
  ],
  
  pink: [
    'pink', 'rose', 'salmon', 'coral', 'blush', 'flamingo', 'watermelon',
    'bubblegum', 'cerise'
  ],
  
  purple: [
    'purple', 'violet', 'lavender', 'lilac', 'mauve', 'plum', 'indigo',
    'amethyst', 'periwinkle', 'magenta', 'fuchsia', 'orchid', 'mulberry',
    'eggplant', 'grape'
  ],
  
  blue: [
    'blue', 'navy', 'cobalt', 'azure', 'cyan', 'teal', 'turquoise', 
    'aqua', 'cerulean', 'sapphire', 'royal', 'sky', 'denim', 'steel',
    'powder blue', 'baby blue', 'midnight', 'ocean'
  ],
  
  green: [
    'green', 'olive', 'emerald', 'lime', 'mint', 'jade', 'sage', 'forest',
    'chartreuse', 'avocado', 'moss', 'pistachio', 'seafoam', 'hunter', 'shamrock',
    'juniper', 'seaweed'
  ],
  
  yellow: [
    'yellow', 'gold', 'amber', 'lemon', 'mustard', 'banana', 'honey', 'cream',
    'butter', 'daffodil', 'flaxen', 'canary', 'dandelion', 'sunshine'
  ],
  
  orange: [
    'orange', 'tangerine', 'peach', 'apricot', 'cantaloupe', 'carrot', 'rust',
    'copper', 'terracotta', 'pumpkin', 'clay', 'ginger', 'cinnamon'
  ],
  
  brown: [
    'brown', 'tan', 'chocolate', 'coffee', 'caramel', 'mahogany', 'chestnut', 
    'hazel', 'umber', 'sienna', 'bronze', 'walnut', 'mocha', 'hickory',
    'cocoa', 'cacao', 'sepia', 'russet', 'tawny'
  ],
  
  beige: [
    'beige', 'cream', 'off-white', 'ecru', 'khaki', 'taupe', 'tan', 'fawn',
    'eggshell', 'sand', 'oatmeal', 'ivory', 'champagne', 'buff', 'vanilla'
  ],
  
  white: [
    'white', 'snow', 'ivory', 'pearl', 'alabaster', 'chalk', 'milk', 'ghost',
    'porcelain', 'bone', 'paper', 'cloud', 'linen', 'frost'
  ],
  
  gray: [
    'gray', 'grey', 'silver', 'slate', 'ash', 'charcoal', 'graphite', 'iron',
    'steel', 'stone', 'pewter', 'smoke', 'cement', 'fossil', 'lead', 'anchor'
  ],
  
  black: [
    'black', 'ebony', 'onyx', 'jet', 'coal', 'obsidian', 'raven', 'midnight',
    'ink', 'pitch', 'shadow'
  ]
};

/**
 * Maps any color name to its standardized category
 * @param {string} colorName - The color name to classify
 * @returns {string} The standardized color category
 */
export function classifyColor(colorName) {
  if (!colorName) return 'unknown';
  
  const normalizedColor = colorName.toLowerCase().trim();
  
  // Special cases for patterned/multicolor
  if (normalizedColor.includes('pattern') || 
      normalizedColor.includes('stripe') || 
      normalizedColor.includes('check') || 
      normalizedColor.includes('floral') || 
      normalizedColor.includes('print')) {
    return 'patterned';
  }
  
  if (normalizedColor.includes('multi') || 
      normalizedColor.includes('rainbow') || 
      normalizedColor.includes('various') ||
      normalizedColor.includes('colorful')) {
    return 'multicolor';
  }
  
  // Check all color groups
  for (const [category, variations] of Object.entries(COLOR_GROUPS)) {
    if (variations.some(color => 
        normalizedColor === color || 
        normalizedColor.includes(color) ||
        color.includes(normalizedColor))) {
      return category;
    }
  }
  
  return 'unknown';
}

/**
 * Returns the complete mapping of all color variations to their standard categories
 * @returns {Object} The complete color mapping
 */
export function getColorMapping() {
  const mapping = {};
  
  // Build the complete mapping
  for (const [category, variations] of Object.entries(COLOR_GROUPS)) {
    for (const variation of variations) {
      mapping[variation] = category;
    }
  }
  
  // Add pattern/multicolor mappings
  mapping['striped'] = 'patterned';
  mapping['checkered'] = 'patterned';
  mapping['plaid'] = 'patterned';
  mapping['floral'] = 'patterned';
  mapping['dotted'] = 'patterned';
  mapping['patterned'] = 'patterned';
  mapping['multicolor'] = 'multicolor';
  mapping['multicolored'] = 'multicolor';
  mapping['rainbow'] = 'multicolor';
  mapping['colorful'] = 'multicolor';
  
  return mapping;
}

/**
 * Get all standard color categories
 * @returns {string[]} Array of standard color categories
 */
export function getStandardColors() {
  return Object.keys(COLOR_GROUPS);
}

/**
 * Get all variations for a specific color category
 * @param {string} category - The color category
 * @returns {string[]} Array of color variations
 */
export function getColorVariations(category) {
  return COLOR_GROUPS[category] || [];
} 