export interface Transaction {
  transaction_id: number;
  order_id: number | null;
  supply_id: number | null;
  amount: number;
  transaction_date: string | null;
  order_date?: string | null;
  order_id_display?: number | null;
  client_name?: string | null;
  order_total_amount?: number;
  supply_data_time?: string | null;
  supply_id_display?: number | null;
  supply_total_price?: number;
  // Added for UI convenience
  type?: 'order' | 'supply' | 'manual';
  label?: string;
}

