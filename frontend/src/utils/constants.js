export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4040';

export const CATEGORIES = [
  'All',
  'Music & Concerts',
  'Theatre & Performing Arts',
  'Stand-up Comedy',
  'Tech & Innovation',
  'Arts & Culture',
  'Screenings',
];

export const HYDERABAD_AREAS = [
  'All Locations',
  'Gachibowli',
  'Hitec City',
  'Jubilee Hills',
  'Banjara Hills',
  'Madhapur',
  'Begumpet',
  'Financial District',
];

// Curated high quality editorial imagery presets for categories
export const CATEGORY_IMAGE_MAP = {
  'music': 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  'concert': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'theatre': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
  'comedy': 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
  'tech': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'art': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
};

export const getEventImage = (category, _id = 1) => {
  if (!category) return CATEGORY_IMAGE_MAP.default;
  const key = category.toLowerCase();
  for (const cat of Object.keys(CATEGORY_IMAGE_MAP)) {
    if (key.includes(cat)) return CATEGORY_IMAGE_MAP[cat];
  }
  return CATEGORY_IMAGE_MAP.default;
};
