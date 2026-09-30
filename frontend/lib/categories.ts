// Single source of truth for menu categories.
// Must match the menu_items_category_check constraint (see backend/supabase/migrations).

export const CATEGORIES = [
  { value: 'appetizer',  ka: 'წასახემსებელი',          en: 'Appetizers',     emoji: '🥟', bg: '#dbeafe', color: '#1e40af' },
  { value: 'soup',       ka: 'წვნიანი',                en: 'Soups',          emoji: '🍲', bg: '#ffedd5', color: '#c2410c' },
  { value: 'salad',      ka: 'სალათი',                 en: 'Salads',         emoji: '🥗', bg: '#d9f99d', color: '#3f6212' },
  { value: 'main',       ka: 'მთავარი კერძი',          en: 'Main Course',    emoji: '🍽️', bg: '#dcfce7', color: '#15803d' },
  { value: 'meat',       ka: 'ხორცის კერძები',         en: 'Meat',           emoji: '🥩', bg: '#fee2e2', color: '#b91c1c' },
  { value: 'poultry',    ka: 'ქათმის კერძები',         en: 'Poultry',        emoji: '🍗', bg: '#fef3c7', color: '#b45309' },
  { value: 'seafood',    ka: 'თევზი და ზღვის პროდუქტები', en: 'Seafood',     emoji: '🐟', bg: '#cffafe', color: '#0e7490' },
  { value: 'pasta',      ka: 'პასტა',                  en: 'Pasta',          emoji: '🍝', bg: '#fef9c3', color: '#a16207' },
  { value: 'vegetarian', ka: 'ვეგეტარიანული',          en: 'Vegetarian',     emoji: '🥦', bg: '#ecfccb', color: '#4d7c0f' },
  { value: 'dessert',    ka: 'დესერტი',                en: 'Desserts',       emoji: '🍰', bg: '#fce7f3', color: '#be185d' },
  { value: 'smoothie',   ka: 'სმუზი და შეიქი',         en: 'Smoothies & Shakes', emoji: '🥤', bg: '#f3e8ff', color: '#7e22ce' },
  { value: 'beverage',   ka: 'გამაგრილებელი სასმელი',  en: 'Cold Drinks',    emoji: '🍹', bg: '#e9d5ff', color: '#6d28d9' },
  { value: 'hot_drink',  ka: 'ცხელი სასმელი',          en: 'Hot Drinks',     emoji: '☕', bg: '#f5f5f4', color: '#57534e' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];
export type CategoryMeta = (typeof CATEGORIES)[number];

export const CATEGORY_VALUES: Category[] = CATEGORIES.map((c) => c.value);

const FALLBACK: CategoryMeta = CATEGORIES[3];

export function categoryMeta(value: string): CategoryMeta {
  return CATEGORIES.find((c) => c.value === value) ?? FALLBACK;
}

export function categoryLabel(value: string, language: string = 'ka'): string {
  const meta = CATEGORIES.find((c) => c.value === value);
  if (!meta) return value;
  return language === 'ka' ? meta.ka : meta.en;
}
