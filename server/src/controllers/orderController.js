import db from "../config/db.js";

export const getAllOrders = async (req, res) => {
  try {
    const sql = `
      SELECT o.*, 
        c.full_name as client_name, 
        e.full_name as employee_name, 
        s.status_name,
        COALESCE(SUM(d.price_for_client * od.quantity_of_dishes), 0) as total_amount,
        GROUP_CONCAT(
          CONCAT(d.name, ' (x', od.quantity_of_dishes, ')') 
          SEPARATOR ', '
        ) as order_items
      FROM Orders o
      LEFT JOIN Clients c ON o.client_id = c.client_id
      LEFT JOIN Employees e ON o.employee_id = e.employee_id
      LEFT JOIN Statuses s ON o.status_id = s.status_id
      LEFT JOIN Order_details od ON o.order_id = od.order_id
      LEFT JOIN Dishes d ON od.dish_id = d.dish_id
      GROUP BY o.order_id, o.order_date, o.client_id, o.employee_id, o.status_id, o.delivery_address, c.full_name, e.full_name, s.status_name
      ORDER BY o.order_id DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати замовлення" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT o.*, c.full_name as client_name, e.full_name as employee_name, s.status_name
      FROM Orders o
      LEFT JOIN Clients c ON o.client_id = c.client_id
      LEFT JOIN Employees e ON o.employee_id = e.employee_id
      LEFT JOIN Statuses s ON o.status_id = s.status_id
      WHERE o.order_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Замовлення не знайдене" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати замовлення" });
  }
};

const upsertTransactionForOrder = async (orderId) => {
  const [orderDetails] = await db.query(`
    SELECT SUM(d.price_for_client * od.quantity_of_dishes) as total
    FROM Order_details od
    JOIN Dishes d ON od.dish_id = d.dish_id
    WHERE od.order_id = ?
  `, [orderId]);
  const total = parseFloat(orderDetails[0]?.total || 0);

  const [existing] = await db.query("SELECT transaction_id FROM Transactions WHERE order_id = ?", [orderId]);
  if (existing.length > 0) {
    await db.query("UPDATE Transactions SET amount = ?, transaction_date = ? WHERE transaction_id = ?", [total, new Date(), existing[0].transaction_id]);
  } else {
    await db.query("INSERT INTO Transactions (order_id, supply_id, amount, transaction_date) VALUES (?, NULL, ?, ?)", [orderId, total, new Date()]);
  }
};

export const createOrder = async (req, res) => {
  const connection = db;
  try {
    const { order_date, client_id, employee_id, status_id, delivery_address, order_items } = req.body;

    await connection.query("START TRANSACTION");

    const [result] = await connection.query(
      "INSERT INTO Orders (order_date, client_id, employee_id, status_id, delivery_address) VALUES (?, ?, ?, ?, ?)",
      [order_date || new Date(), client_id || null, employee_id || null, status_id || null, delivery_address || null]
    );

    const orderId = result.insertId;

    const shortages = [];

    if (Array.isArray(order_items) && order_items.length > 0) {
      for (const item of order_items) {
        const dishId = item.dish_id;
        const qty = item.quantity_of_dishes || 1;
        const note = item.note || null;

        const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
        for (const r of recipes) {
          const need = (r.quantity_grams || 0) * qty;
          const [products] = await connection.query("SELECT product_id, name, COALESCE(quantity_grams,0) as quantity_grams FROM Products WHERE product_id = ?", [r.product_id]);
          const prod = products[0];
          if (!prod || prod.quantity_grams < need) {
            shortages.push({ product_id: r.product_id, product_name: prod ? prod.name : "Unknown", required: need, available: prod ? prod.quantity_grams : 0 });
          }
        }

       
      }
    }

    if (shortages.length > 0) {
      await connection.query("ROLLBACK");
      return res.status(400).json({ error: "Недостатньо продуктів для замовлення", shortages });
    }

    if (Array.isArray(order_items) && order_items.length > 0) {
      for (const item of order_items) {
        const dishId = item.dish_id;
        const qty = item.quantity_of_dishes || 1;
        const note = item.note || null;

        await connection.query(
          `INSERT INTO Order_details (order_id, dish_id, quantity_of_dishes, note)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity_of_dishes = quantity_of_dishes + VALUES(quantity_of_dishes), note = VALUES(note)`,
          [orderId, dishId, qty, note]
        );

        const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
        for (const r of recipes) {
          const totalDeduct = (r.quantity_grams || 0) * (qty || 0);
          if (totalDeduct !== 0) {
            await connection.query("UPDATE Products SET quantity_grams = COALESCE(quantity_grams,0) - ? WHERE product_id = ?", [totalDeduct, r.product_id]);
          }
        }
      }
    }

    await upsertTransactionForOrder(orderId);

    await connection.query("COMMIT");

    res.status(201).json({ order_id: orderId, message: "Замовлення успішно створене" });
  } catch (error) {
    console.error(error);
    try { await connection.query("ROLLBACK"); } catch (e) { console.error("Rollback error:", e); }
    res.status(500).json({ error: "Не вдалося створити замовлення" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_date, client_id, employee_id, status_id, delivery_address } = req.body;
    const [result] = await db.query(
      "UPDATE Orders SET order_date = ?, client_id = ?, employee_id = ?, status_id = ?, delivery_address = ? WHERE order_id = ?",
      [order_date || null, client_id || null, employee_id || null, status_id || null, delivery_address || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Замовлення не знайдене" });
    }
    res.json({ message: "Замовлення успішно оновлене" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити замовлення" });
  }
};

export const deleteOrder = async (req, res) => {
  const connection = db;
  try {
    const { id } = req.params;
    await connection.query("START TRANSACTION");

    await connection.query("DELETE FROM Transactions WHERE order_id = ?", [id]);

    const [result] = await connection.query("DELETE FROM Orders WHERE order_id = ?", [id]);
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Замовлення не знайдене" });
    }

    await connection.query("COMMIT");
    res.json({ message: "Замовлення успішно видалене" });
  } catch (error) {
    console.error(error);
    try { await connection.query("ROLLBACK"); } catch (e) { console.error("Rollback error:", e); }
    res.status(500).json({ error: "Не вдалося видалити замовлення" });
  }
};

