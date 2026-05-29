export interface OrderDetail {
  order_id: number;
  dish_id: number;
  quantity_of_dishes: number;
  note: string | null;
  dish_name?: string;
  price_for_client?: number;
  order_date?: string;
}

