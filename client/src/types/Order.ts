export interface Order {
  order_id: number;
  order_date: string | null;
  client_id: number | null;
  employee_id: number | null;
  status_id: number | null;
  delivery_address: string | null;
  client_name?: string | null;
  employee_name?: string | null;
  status_name?: string | null;
  total_amount?: number;
  order_items?: string | null;
}

