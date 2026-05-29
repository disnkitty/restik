export interface SupplyDetail {
  supply_id: number;
  product_id: number;
  quantity_grams: number;
  expiration_date: string | null;
  product_name?: string;
  supply_data_time?: string;
}

