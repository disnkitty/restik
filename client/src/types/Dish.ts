export interface Dish {
  dish_id: number;
  name: string;
  weight_grams: number | null;
  price_for_client: number | null;
  recipe_description: string | null;
  dish_type_id: number | null;
  preparation_time_minutes: number | null;
  calories: number | null;
  dish_type_name?: string | null;
}
