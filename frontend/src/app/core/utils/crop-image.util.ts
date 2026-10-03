/**
 * Utility to map agricultural commodities to high-quality visual assets.
 * Uses curated, high-definition agricultural imagery with local asset fallbacks.
 */
const CROP_IMAGE_MAP: Record<string, string> = {
  // ── Grains ────────────────────────────────────────────────────────
  rice:       'assets/images/crop-rice.jpg',
  paddy:      'assets/images/crop-rice.jpg',
  basmati:    'assets/images/crop-rice.jpg',
  wheat:      'assets/images/crop-wheat.jpg',
  sharbati:   'assets/images/crop-wheat.jpg',
  maize:      'assets/images/crop-maize.jpg',
  corn:       'assets/images/crop-maize.jpg',
  barley:     'assets/images/crop-wheat.jpg',
  bajra:      'assets/images/crop-bajra.jpg',
  'pearl millet': 'assets/images/crop-bajra.jpg',
  jowar:      'assets/images/crop-maize.jpg',
  sorghum:    'assets/images/crop-maize.jpg',
  ragi:       'assets/images/crop-wheat.jpg',
  millet:     'assets/images/crop-bajra.jpg',
  oat:        'assets/images/crop-wheat.jpg',

  // ── Vegetables ────────────────────────────────────────────────────
  tomato:     'assets/images/crop-tomato.jpg',
  onion:      'assets/images/crop-onion.jpg',
  potato:     'assets/images/crop-potato.jpg',
  chilli:     'assets/images/crop-chilli.jpg',
  chili:      'assets/images/crop-chilli.jpg',
  'red chilli':'assets/images/crop-chilli.jpg',
  'green chilli': 'assets/images/crop-green-chilli.jpg',
  'green chili':  'assets/images/crop-green-chilli.jpg',
  capsicum:   'assets/images/crop-green-chilli.jpg',
  garlic:     'assets/images/crop-garlic.jpg',
  ginger:     'assets/images/crop-ginger.jpg',
  carrot:     'assets/images/crop-potato.jpg',
  cauliflower:'assets/images/crop-potato.jpg',
  cabbage:    'assets/images/crop-onion.jpg',
  brinjal:    'assets/images/crop-tomato.jpg',
  eggplant:   'assets/images/crop-tomato.jpg',
  'lady finger': 'assets/images/crop-green-chilli.jpg',
  okra:       'assets/images/crop-green-chilli.jpg',
  pumpkin:    'assets/images/crop-sugarcane.jpg',
  'bitter gourd': 'assets/images/crop-maize.jpg',
  drumstick:  'assets/images/crop-sugarcane.jpg',
  coriander:  'assets/images/crop-turmeric.jpg',
  fenugreek:  'assets/images/crop-turmeric.jpg',

  // ── Pulses / Legumes ──────────────────────────────────────────────
  groundnut:  'assets/images/crop-groundnut.jpg',
  peanut:     'assets/images/crop-groundnut.jpg',
  soybean:    'assets/images/crop-soybean.jpg',
  soya:       'assets/images/crop-soybean.jpg',
  'arhar dal':'assets/images/crop-soybean.jpg',
  'pigeon pea':'assets/images/crop-soybean.jpg',
  'moong dal':'assets/images/crop-groundnut.jpg',
  'urad dal': 'assets/images/crop-groundnut.jpg',
  lentil:     'assets/images/crop-groundnut.jpg',
  dal:        'assets/images/crop-groundnut.jpg',
  pulse:      'assets/images/crop-groundnut.jpg',
  gram:       'assets/images/crop-groundnut.jpg',
  chickpea:   'assets/images/crop-groundnut.jpg',

  // ── Cash Crops / Oil Seeds ────────────────────────────────────────
  cotton:     'assets/images/crop-cotton.jpg',
  sugarcane:  'assets/images/crop-sugarcane.jpg',
  mustard:    'assets/images/crop-mustard.jpg',
  sesame:     'assets/images/crop-groundnut.jpg',
  sunflower:  'assets/images/crop-mustard.jpg',
  linseed:    'assets/images/crop-wheat.jpg',
  castor:     'assets/images/crop-cotton.jpg',
  safflower:  'assets/images/crop-turmeric.jpg',

  // ── Spices ────────────────────────────────────────────────────────
  turmeric:   'assets/images/crop-turmeric.jpg',
  cardamom:   'assets/images/crop-turmeric.jpg',
  pepper:     'assets/images/crop-chilli.jpg',
  'black pepper': 'assets/images/crop-chilli.jpg',
  clove:      'assets/images/crop-turmeric.jpg',
  nutmeg:     'assets/images/crop-groundnut.jpg',
  saffron:    'assets/images/crop-turmeric.jpg',
  tamarind:   'assets/images/crop-sugarcane.jpg',
  vanilla:    'assets/images/crop-turmeric.jpg',

  // ── Fruits ────────────────────────────────────────────────────────
  banana:     'assets/images/crop-banana.jpg',
  mango:      'assets/images/crop-mango.jpg',
  apple:      'assets/images/crop-orange.jpg',
  orange:     'assets/images/crop-orange.jpg',
  grape:      'assets/images/crop-banana.jpg',
  guava:      'assets/images/crop-banana.jpg',
  papaya:     'assets/images/crop-banana.jpg',
  coconut:    'assets/images/crop-coconut.jpg',
  pineapple:  'assets/images/crop-banana.jpg',
  watermelon: 'assets/images/crop-tomato.jpg',
  pomegranate:'assets/images/crop-tomato.jpg',
  jackfruit:  'assets/images/crop-banana.jpg',
  litchi:     'assets/images/crop-banana.jpg',
  amla:       'assets/images/crop-banana.jpg',
  jamun:      'assets/images/crop-banana.jpg',
  sapota:     'assets/images/crop-banana.jpg',
  strawberry: 'assets/images/crop-tomato.jpg',
  lemon:      'assets/images/crop-orange.jpg',

  // ── Plantation Crops ──────────────────────────────────────────────
  tea:        'assets/images/crop-cotton.jpg',
  coffee:     'assets/images/crop-groundnut.jpg',
};

export function getCropImageUrl(commodity: string): string {
  if (!commodity) return 'assets/images/crop-rice.jpg';
  const c = commodity.toLowerCase();

  // Exact match first
  if (CROP_IMAGE_MAP[c]) return CROP_IMAGE_MAP[c];

  // Partial match
  for (const [key, url] of Object.entries(CROP_IMAGE_MAP)) {
    if (c.includes(key) || key.includes(c)) {
      return url;
    }
  }

  return 'assets/images/crop-rice.jpg';
}

export const getCropImage = getCropImageUrl;
