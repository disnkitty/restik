import db from "../config/db.js";

export const getAllSupplyDetails = async (req, res) => {
  try {
    const sql = `
      SELECT sd.*, p.name as product_name, s.supply_data_time
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      JOIN Supplies s ON sd.supply_id = s.supply_id
      ORDER BY sd.supply_id DESC, sd.product_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати деталі поставок" });
  }
};

export const getSupplyDetailsBySupplyId = async (req, res) => {
  try {
    const { supplyId } = req.params;
    const sql = `
      SELECT sd.*, p.name as product_name
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      WHERE sd.supply_id = ?
      ORDER BY sd.product_id
    `;
    const [rows] = await db.query(sql, [supplyId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати деталі поставки" });
  }
};

const upsertTransactionForSupply = async (supplyId) => {
  const [details] = await db.query(`
    SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
    FROM Supply_Details sd
    JOIN Products p ON sd.product_id = p.product_id
    WHERE sd.supply_id = ?
  `, [supplyId]);
  const total = parseFloat(details[0]?.total || 0);

  const signedAmount = total > 0 ? -total : 0;

  const [existing] = await db.query("SELECT transaction_id FROM Transactions WHERE supply_id = ?", [supplyId]);
  if (existing.length > 0) {
    await db.query("UPDATE Transactions SET amount = ?, transaction_date = ? WHERE transaction_id = ?", [signedAmount, new Date(), existing[0].transaction_id]);
  } else {
    if (signedAmount !== 0) {
      await db.query("INSERT INTO Transactions (order_id, supply_id, amount, transaction_date) VALUES (NULL, ?, ?, ?)", [supplyId, signedAmount, new Date()]);
    }
  }
};

export const createSupplyDetail = async (req, res) => {
  const connection = db;
  try {
    const { supply_id, product_id, quantity_grams, expiration_date } = req.body;
    await connection.query("START TRANSACTION");

    await connection.query(
      "INSERT INTO Supply_Details (supply_id, product_id, quantity_grams, expiration_date) VALUES (?, ?, ?, ?)",
      [supply_id, product_id, quantity_grams, expiration_date || null]
    );

    await connection.query(
      "UPDATE Products SET quantity_grams = COALESCE(quantity_grams, 0) + ? WHERE product_id = ?",
      [quantity_grams, product_id]
    );

    const [details] = await connection.query(`
      SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      WHERE sd.supply_id = ?
    `, [supply_id]);

    const totalPrice = parseFloat(details[0]?.total || 0);
    await connection.query(
      "UPDATE Supplies SET total_price = ? WHERE supply_id = ?",
      [totalPrice, supply_id]
    );

    await upsertTransactionForSupply(supply_id);

    await connection.query("COMMIT");
    res.status(201).json({ message: "Деталь поставки успішно створена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Така деталь поставки вже існує" });
    }
    res.status(500).json({ error: "Не вдалося створити деталь поставки" });
  }
};

export const updateSupplyDetail = async (req, res) => {
  const connection = db;
  try {
    const { supplyId, productId } = req.params;
    const { quantity_grams, expiration_date } = req.body;

    await connection.query("START TRANSACTION");

    const [existingRows] = await connection.query(
      "SELECT quantity_grams FROM Supply_Details WHERE supply_id = ? AND product_id = ?",
      [supplyId, productId]
    );
    if (existingRows.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь поставки не знайдена" });
    }

    const oldQty = existingRows[0].quantity_grams || 0;
    const delta = (quantity_grams || 0) - oldQty;

    const [result] = await connection.query(
      "UPDATE Supply_Details SET quantity_grams = ?, expiration_date = ? WHERE supply_id = ? AND product_id = ?",
      [quantity_grams, expiration_date || null, supplyId, productId]
    );
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь поставки не знайдена" });
    }

    if (delta !== 0) {
      await connection.query(
        "UPDATE Products SET quantity_grams = COALESCE(quantity_grams, 0) + ? WHERE product_id = ?",
        [delta, productId]
      );
    }

    const [details] = await connection.query(`
      SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      WHERE sd.supply_id = ?
    `, [supplyId]);

    const totalPrice = parseFloat(details[0]?.total || 0);
    try {
      await connection.query(
        "UPDATE Supplies SET total_price = ? WHERE supply_id = ?",
        [totalPrice, supplyId]
      );
    } catch (updateError) {
      console.error("Could not update total_price:", updateError);
    }

    await upsertTransactionForSupply(supplyId);

    await connection.query("COMMIT");
    res.json({ message: "Деталь поставки успішно оновлена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    res.status(500).json({ error: "Не вдалося оновити деталь поставки" });
  }
};

export const deleteSupplyDetail = async (req, res) => {
  const connection = db;
  try {
    const { supplyId, productId } = req.params;
    await connection.query("START TRANSACTION");

    const [existingRows] = await connection.query(
      "SELECT quantity_grams FROM Supply_Details WHERE supply_id = ? AND product_id = ?",
      [supplyId, productId]
    );
    if (existingRows.length === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь поставки не знайдена" });
    }

    const qtyToRemove = existingRows[0].quantity_grams || 0;

    const [result] = await connection.query(
      "DELETE FROM Supply_Details WHERE supply_id = ? AND product_id = ?",
      [supplyId, productId]
    );
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Деталь поставки не знайдена" });
    }

    await connection.query(
      "UPDATE Products SET quantity_grams = COALESCE(quantity_grams, 0) - ? WHERE product_id = ?",
      [qtyToRemove, productId]
    );

    const [details] = await connection.query(`
      SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      WHERE sd.supply_id = ?
    `, [supplyId]);

    const totalPrice = parseFloat(details[0]?.total || 0);
    try {
      await connection.query(
        "UPDATE Supplies SET total_price = ? WHERE supply_id = ?",
        [totalPrice, supplyId]
      );
    } catch (updateError) {
      console.error("Could not update total_price:", updateError);
    }

    await upsertTransactionForSupply(supplyId);

    await connection.query("COMMIT");
    res.json({ message: "Деталь поставки успішно видалена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    res.status(500).json({ error: "Не вдалося видалити деталь поставки" });
  }
};

