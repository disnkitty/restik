export interface Product {
  product_id: number;
  name: string;
  quantity_grams: number | null;
  supplier_id: number | null;
  supplier_price: number | null;
  product_category_id: number | null;
  supplier_name?: string | null;
  name_product_category?: string | null;
}