

ALTER TABLE Supplies 
ADD COLUMN total_price DECIMAL(10, 2) DEFAULT 0.00;

UPDATE Supplies s
SET total_price = COALESCE((
  SELECT SUM(sd.quantity_grams * p.supplier_price / 1000)
  FROM Supply_Details sd
  JOIN Products p ON sd.product_id = p.product_id
  WHERE sd.supply_id = s.supply_id
), 0);

