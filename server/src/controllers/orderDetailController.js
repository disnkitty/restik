import db from "../config/db.js";

export const getAllOrderDetails = async (req, res) => {
  try {
    const sql = `
      SELECT od.*, d.name as dish_name, o.order_date
      FROM Order_details od
      JOIN Dishes d ON od.dish_id = d.dish_id
      JOIN Orders o ON od.order_id = o.order_id
      ORDER BY od.order_id DESC, od.dish_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати деталі замовлень" });
  }
};

export const getOrderDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sql = `
      SELECT od.*, d.name as dish_name, d.price_for_client
      FROM Order_details od
      JOIN Dishes d ON od.dish_id = d.dish_id
      WHERE od.order_id = ?
      ORDER BY od.dish_id
    `;
    const [rows] = await db.query(sql, [orderId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати деталі замовлення" });
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
    if (total > 0) {
      await db.query("INSERT INTO Transactions (order_id, supply_id, amount, transaction_date) VALUES (?, NULL, ?, ?)", [orderId, total, new Date()]);
    }
  }
};

export const createOrderDetail = async (req, res) => {
  const connection = db;
  try {
    const { order_id, dish_id, quantity_of_dishes, note } = req.body;

    await connection.query("START TRANSACTION");

    const [existing] = await connection.query("SELECT quantity_of_dishes FROM Order_details WHERE order_id = ? AND dish_id = ?", [order_id, dish_id]);
    const isExisting = existing.length > 0;

    if (isExisting) {
      await connection.query("UPDATE Order_details SET quantity_of_dishes = quantity_of_dishes + ?, note = ? WHERE order_id = ? AND dish_id = ?", [quantity_of_dishes, note || null, order_id, dish_id]);
    } else {
      await connection.query("INSERT INTO Order_details (order_id, dish_id, quantity_of_dishes, note) VALUES (?, ?, ?, ?)", [order_id, dish_id, quantity_of_dishes, note || null]);
    }

    const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dish_id]);
    for (const r of recipes) {
      const totalDeduct = (r.quantity_grams || 0) * (quantity_of_dishes || 0);
      if (totalDeduct !== 0) {
        await connection.query("UPDATE Products SET quantity_grams = COALESCE(quantity_grams,0) - ? WHERE product_id = ?", [totalDeduct, r.product_id]);
      }
    }

    await upsertTransactionForOrder(order_id);

    await connection.query("COMMIT");
    res.status(201).json({ message: "Деталь замовлення успішно створена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    res.status(500).json({ error: "Не вдалося створити деталь замовлення" });
  }
};

export const updateOrderDetail = async (req, res) => {
  const connection = db;
  try {
    const { orderId, dishId } = req.params;
    const { quantity_of_dishes, note } = req.body;

    await connection.query("START TRANSACTION");

    const [existingRows] = await connection.query("SELECT quantity_of_dishes FROM Order_details WHERE order_id = ? AND dish_id = ?", [orderId, dishId]);
    if (existingRows.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь замовлення не знайдена" });
    }

    const oldQty = existingRows[0].quantity_of_dishes || 0;
    const delta = (quantity_of_dishes || 0) - oldQty;

    const [result] = await connection.query(
      "UPDATE Order_details SET quantity_of_dishes = ?, note = ? WHERE order_id = ? AND dish_id = ?",
      [quantity_of_dishes, note || null, orderId, dishId]
    );
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь замовлення не знайдена" });
    }

    if (delta !== 0) {
      const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
      for (const r of recipes) {
        const totalChange = (r.quantity_grams || 0) * delta;
        await connection.query("UPDATE Products SET quantity_grams = COALESCE(quantity_grams,0) - ? WHERE product_id = ?", [totalChange, r.product_id]);
      }
    }

    await upsertTransactionForOrder(orderId);

    await connection.query("COMMIT");
    res.json({ message: "Деталь замовлення успішно оновлена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    res.status(500).json({ error: "Не вдалося оновити деталь замовлення" });
  }
};

export const deleteOrderDetail = async (req, res) => {
  const connection = db;
  try {
    const { orderId, dishId } = req.params;

    await connection.query("START TRANSACTION");

    const [existingRows] = await connection.query("SELECT quantity_of_dishes FROM Order_details WHERE order_id = ? AND dish_id = ?", [orderId, dishId]);
    if (existingRows.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь замовлення не знайдена" });
    }
    const qtyToReturn = existingRows[0].quantity_of_dishes || 0;

    const [result] = await connection.query(
      "DELETE FROM Order_details WHERE order_id = ? AND dish_id = ?",
      [orderId, dishId]
    );
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь замовлення не знайдена" });
    }

    const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
    for (const r of recipes) {
      const totalReturn = (r.quantity_grams || 0) * qtyToReturn;
      if (totalReturn !== 0) {
        await connection.query("UPDATE Products SET quantity_grams = COALESCE(quantity_grams,0) + ? WHERE product_id = ?", [totalReturn, r.product_id]);
      }
    }

    await upsertTransactionForOrder(orderId);

    await connection.query("COMMIT");
    res.json({ message: "Деталь замовлення успішно видалена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    res.status(500).json({ error: "Не вдалося видалити деталь замовлення" });
  }
};

export const checkReplacementAvailability = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body; 
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });


    const [existingRows] = await db.query("SELECT dish_id, quantity_of_dishes FROM Order_details WHERE order_id = ?", [orderId]);
    const existingMap = new Map();
    for (const r of existingRows) existingMap.set(r.dish_id, r.quantity_of_dishes || 0);


    const productDeltas = new Map(); 

    for (const it of items) {
      const dishId = it.dish_id;
      const newQty = it.quantity_of_dishes || 0;
      const oldQty = existingMap.get(dishId) || 0;
      const deltaQty = newQty - oldQty; 
      if (deltaQty === 0) continue;
      const [recipes] = await db.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
      for (const r of recipes) {
        const delta = (r.quantity_grams || 0) * deltaQty;
        const prev = productDeltas.get(r.product_id) || 0;
        productDeltas.set(r.product_id, prev + delta);
      }
    }

    const toCheck = Array.from(productDeltas.entries()).filter(([pid, delta]) => delta > 0).map(([pid])=>pid);
    if (toCheck.length === 0) return res.json({ available: true, shortages: [] });

    const [products] = await db.query(`SELECT product_id, name, COALESCE(quantity_grams,0) as quantity_grams FROM Products WHERE product_id IN (${toCheck.map(()=>'?').join(',')})`, toCheck);
    const shortages = [];
    const prodMap = new Map(products.map(p=>[p.product_id, p]));
    for (const [pid, delta] of productDeltas.entries()) {
      if (delta > 0) {
        const p = prodMap.get(pid);
        const avail = p ? p.quantity_grams : 0;
        if (avail < delta) shortages.push({ product_id: pid, product_name: p ? p.name : 'Unknown', required: delta, available: avail });
      }
    }

    res.json({ available: shortages.length === 0, shortages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка перевірки доступності' });
  }
};

export const replaceOrderDetails = async (req, res) => {
  const connection = db;
  try {
    const { orderId } = req.params;
    const { items } = req.body; 
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

    await connection.query('START TRANSACTION');

    
    const [existingRows] = await connection.query("SELECT dish_id, quantity_of_dishes FROM Order_details WHERE order_id = ?", [orderId]);
    const existingMap = new Map();
    for (const r of existingRows) existingMap.set(r.dish_id, r.quantity_of_dishes || 0);

   
    const productDeltas = new Map(); 

    const newDishIds = new Set();
    for (const it of items) {
      const dishId = it.dish_id;
      const newQty = it.quantity_of_dishes || 0;
      newDishIds.add(dishId);
      const oldQty = existingMap.get(dishId) || 0;
      const deltaQty = newQty - oldQty; 
      if (deltaQty === 0) continue;
      const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
      for (const r of recipes) {
        const delta = (r.quantity_grams || 0) * deltaQty;
        const prev = productDeltas.get(r.product_id) || 0;
        productDeltas.set(r.product_id, prev + delta);
      }
    }

    for (const [dishId, oldQty] of existingMap.entries()) {
      if (!newDishIds.has(dishId)) {
        const [recipes] = await connection.query("SELECT product_id, quantity_grams FROM Recipes WHERE dish_id = ?", [dishId]);
        for (const r of recipes) {
          const delta = (r.quantity_grams || 0) * (0 - oldQty);
          const prev = productDeltas.get(r.product_id) || 0;
          productDeltas.set(r.product_id, prev + delta);
        }
      }
    }

    const toCheck = Array.from(productDeltas.entries()).filter(([pid, delta]) => delta > 0).map(([pid])=>pid);
    if (toCheck.length > 0) {
      const [products] = await connection.query(`SELECT product_id, name, COALESCE(quantity_grams,0) as quantity_grams FROM Products WHERE product_id IN (${toCheck.map(()=>'?').join(',')})`, toCheck);
      const shortages = [];
      const prodMap = new Map(products.map(p=>[p.product_id, p]));
      for (const [pid, delta] of productDeltas.entries()) {
        if (delta > 0) {
          const p = prodMap.get(pid);
          const avail = p ? p.quantity_grams : 0;
          if (avail < delta) shortages.push({ product_id: pid, product_name: p ? p.name : 'Unknown', required: delta, available: avail });
        }
      }
      if (shortages.length > 0) {
        await connection.query('ROLLBACK');
        return res.status(400).json({ error: 'Недостатньо продуктів для оновлення замовлення', shortages });
      }
    }

    for (const it of items) {
      const dishId = it.dish_id;
      const qty = it.quantity_of_dishes || 0;
      const note = it.note || null;
      const [exists] = await connection.query("SELECT quantity_of_dishes FROM Order_details WHERE order_id = ? AND dish_id = ?", [orderId, dishId]);
      if (exists.length > 0) {
        if (qty > 0) {
          await connection.query("UPDATE Order_details SET quantity_of_dishes = ?, note = ? WHERE order_id = ? AND dish_id = ?", [qty, note, orderId, dishId]);
        } else {
          await connection.query("DELETE FROM Order_details WHERE order_id = ? AND dish_id = ?", [orderId, dishId]);
        }
      } else {
        if (qty > 0) {
          await connection.query("INSERT INTO Order_details (order_id, dish_id, quantity_of_dishes, note) VALUES (?, ?, ?, ?)", [orderId, dishId, qty, note]);
        }
      }
    }


    for (const [dishId, oldQty] of existingMap.entries()) {
      if (!newDishIds.has(dishId)) {
        await connection.query("DELETE FROM Order_details WHERE order_id = ? AND dish_id = ?", [orderId, dishId]);
      }
    }

    for (const [pid, delta] of productDeltas.entries()) {
      if (delta === 0) continue;
      await connection.query("UPDATE Products SET quantity_grams = COALESCE(quantity_grams,0) - ? WHERE product_id = ?", [delta, pid]);
    }

    await upsertTransactionForOrder(orderId);

    await connection.query('COMMIT');
    res.json({ message: 'Деталі замовлення успішно оновлено' });
  } catch (error) {
    console.error(error);
    try { await connection.query('ROLLBACK'); } catch (e) { console.error('Rollback error:', e); }
    res.status(500).json({ error: 'Не вдалося оновити деталі замовлення' });
  }
};

