import db from "../config/db.js";

export const getAllTransactions = async (req, res) => {
  try {
    const sql = `
      SELECT
        t.transaction_id,
        t.order_id,
        t.supply_id,
        t.amount,
        t.transaction_date,
        CASE WHEN t.order_id IS NOT NULL THEN 'order' WHEN t.supply_id IS NOT NULL THEN 'supply' ELSE 'manual' END AS type,
        CASE WHEN t.order_id IS NOT NULL THEN CONCAT('Замовлення #', t.order_id) WHEN t.supply_id IS NOT NULL THEN CONCAT('Поставка #', t.supply_id) ELSE 'Ручна' END AS label,
        o.order_date,
        s.supply_data_time,
        c.full_name as client_name
      FROM Transactions t
      LEFT JOIN Orders o ON t.order_id = o.order_id
      LEFT JOIN Clients c ON o.client_id = c.client_id
      LEFT JOIN Supplies s ON t.supply_id = s.supply_id
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    res.status(500).json({ error: "Не вдалося отримати транзакції", details: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Transactions WHERE transaction_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Транзакція не знайдена" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати транзакцію" });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { order_id, supply_id, amount, transaction_date } = req.body;
    
    if (order_id && supply_id) {
      return res.status(400).json({ error: "Транзакція може бути пов'язана або з замовленням, або з поставкою, але не з обома" });
    }
    if (!order_id && !supply_id) {
      return res.status(400).json({ error: "Транзакція повинна бути пов'язана або з замовленням, або з поставкою" });
    }
    
    let calculatedAmount = amount;
    
    if (!amount || amount === 0) {
      if (order_id) {
        const [orderDetails] = await db.query(`
          SELECT SUM(d.price_for_client * od.quantity_of_dishes) as total
          FROM Order_details od
          JOIN Dishes d ON od.dish_id = d.dish_id
          WHERE od.order_id = ?
        `, [order_id]);
        calculatedAmount = parseFloat(orderDetails[0]?.total || 0);
      } else if (supply_id) {
        const [supplyDetails] = await db.query(`
          SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
          FROM Supply_Details sd
          JOIN Products p ON sd.product_id = p.product_id
          WHERE sd.supply_id = ?
        `, [supply_id]);
        calculatedAmount = parseFloat(supplyDetails[0]?.total || 0);
        calculatedAmount = calculatedAmount !== 0 ? -calculatedAmount : 0;
      }
    }
    
    const [result] = await db.query(
      "INSERT INTO Transactions (order_id, supply_id, amount, transaction_date) VALUES (?, ?, ?, ?)",
      [order_id || null, supply_id || null, calculatedAmount, transaction_date || new Date()]
    );
    res.status(201).json({ transaction_id: result.insertId, message: "Транзакція успішно створена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити транзакцію" });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, supply_id, amount, transaction_date } = req.body;
    
    if (order_id && supply_id) {
      return res.status(400).json({ error: "Транзакція може бути пов'язана або з замовленням, або з поставкою, але не з обома" });
    }
    if (!order_id && !supply_id) {
      return res.status(400).json({ error: "Транзакція повинна бути пов'язана або з замовленням, або з поставкою" });
    }
    
    let calculatedAmount = amount;
    
    if (!amount || amount === 0) {
      if (order_id) {
        const [orderDetails] = await db.query(`
          SELECT SUM(d.price_for_client * od.quantity_of_dishes) as total
          FROM Order_details od
          JOIN Dishes d ON od.dish_id = d.dish_id
          WHERE od.order_id = ?
        `, [order_id]);
        calculatedAmount = parseFloat(orderDetails[0]?.total || 0);
      } else if (supply_id) {
        const [supplyDetails] = await db.query(`
          SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
          FROM Supply_Details sd
          JOIN Products p ON sd.product_id = p.product_id
          WHERE sd.supply_id = ?
        `, [supply_id]);
        calculatedAmount = parseFloat(supplyDetails[0]?.total || 0);
        calculatedAmount = calculatedAmount !== 0 ? -calculatedAmount : 0;
      }
    }
    
    const [result] = await db.query(
      "UPDATE Transactions SET order_id = ?, supply_id = ?, amount = ?, transaction_date = ? WHERE transaction_id = ?",
      [order_id || null, supply_id || null, calculatedAmount, transaction_date || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Транзакція не знайдена" });
    }
    res.json({ message: "Транзакція успішно оновлена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити транзакцію" });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Transactions WHERE transaction_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Транзакція не знайдена" });
    }
    res.json({ message: "Транзакція успішно видалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити транзакцію" });
  }
};

