-- Expand allowed menu categories (keep in sync with lib/categories.ts).
alter table public.menu_items drop constraint if exists menu_items_category_check;

alter table public.menu_items
  add constraint menu_items_category_check
  check (category in (
    'appetizer', 'soup', 'salad', 'main', 'meat', 'poultry', 'seafood',
    'pasta', 'vegetarian', 'dessert', 'smoothie', 'beverage', 'hot_drink'
  ));
