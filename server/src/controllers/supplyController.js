import db from "../config/db.js";

export const getAllSupplies = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.supply_id,
        s.supply_data_time,
        COALESCE(SUM(sd.quantity_grams * p.supplier_price / 1000), 0) as calculated_total_price,
        COALESCE(
          GROUP_CONCAT(
            DISTINCT CONCAT(p.name, ' (', sd.quantity_grams, 'г)') 
            SEPARATOR ', '
          ),
          ''
        ) as supply_items
      FROM Supplies s
      LEFT JOIN Supply_Details sd ON s.supply_id = sd.supply_id
      LEFT JOIN Products p ON sd.product_id = p.product_id
      GROUP BY s.supply_id, s.supply_data_time
      ORDER BY s.supply_id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error in getAllSupplies:", error);
    res.status(500).json({ error: "Не вдалося отримати поставки", details: error.message });
  }
};

export const getSupplyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Supplies WHERE supply_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Поставка не знайдена" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати поставку" });
  }
};

const upsertTransactionForSupplyLocal = async (supplyId) => {
  const [details] = await db.query(`
    SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
    FROM Supply_Details sd
    JOIN Products p ON sd.product_id = p.product_id
    WHERE sd.supply_id = ?
  `, [supplyId]);
  const total = parseFloat(details[0]?.total || 0);
  const signedAmount = total !== 0 ? -total : 0;

  const [existing] = await db.query("SELECT transaction_id FROM Transactions WHERE supply_id = ?", [supplyId]);
  if (existing.length > 0) {
    await db.query("UPDATE Transactions SET amount = ?, transaction_date = ? WHERE transaction_id = ?", [signedAmount, new Date(), existing[0].transaction_id]);
  } else {
    await db.query("INSERT INTO Transactions (order_id, supply_id, amount, transaction_date) VALUES (NULL, ?, ?, ?)", [supplyId, signedAmount, new Date()]);
  }
};

export const createSupply = async (req, res) => {
  const connection = db;
  try {
    console.log("createSupply request body:", JSON.stringify(req.body));
    const { supply_data_time, supply_details } = req.body;

    const [colCheck] = await connection.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Supplies' AND COLUMN_NAME = 'total_price'"
    );
    if (colCheck[0].cnt === 0) {
      console.warn("total_price column missing, adding it to Supplies table");
      await connection.query("ALTER TABLE Supplies ADD COLUMN total_price DECIMAL(10,2) DEFAULT 0.00");
    }

    await connection.query("START TRANSACTION");

    const [result] = await connection.query(
      "INSERT INTO Supplies (supply_data_time, total_price) VALUES (?, 0.00)",
      [supply_data_time || new Date()]
    );

    const supplyId = result.insertId;

    if (Array.isArray(supply_details) && supply_details.length > 0) {
      const map = new Map();
      for (const it of supply_details) {
        const pid = parseInt(it.product_id);
        const qty = parseInt(it.quantity_grams) || 0;
        const exp = it.expiration_date || null;
        if (!pid || qty === 0) continue;
        if (map.has(pid)) {
          const prev = map.get(pid);
          prev.quantity += qty;
        } else {
          map.set(pid, { quantity: qty, expiration: exp });
        }
      }

      for (const [productId, obj] of map) {
        if (!productId || obj.quantity <= 0) {
          await connection.query("ROLLBACK");
          return res.status(400).json({ error: "Неправильні дані в позиціях поставки" });
        }
        const [prodRows] = await connection.query("SELECT product_id FROM Products WHERE product_id = ?", [productId]);
        if (prodRows.length === 0) {
          await connection.query("ROLLBACK");
          return res.status(400).json({ error: `Товар з id=${productId} не знайдено` });
        }

        await connection.query(
          "INSERT INTO Supply_Details (supply_id, product_id, quantity_grams, expiration_date) VALUES (?, ?, ?, ?)",
          [supplyId, productId, obj.quantity, obj.expiration]
        );

        await connection.query(
          "UPDATE Products SET quantity_grams = COALESCE(quantity_grams, 0) + ? WHERE product_id = ?",
          [obj.quantity, productId]
        );
      }
    }

    const [details] = await connection.query(`
      SELECT COALESCE(SUM(sd.quantity_grams * p.supplier_price / 1000), 0) as total
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      WHERE sd.supply_id = ?
    `, [supplyId]);

    const totalPrice = parseFloat(details[0]?.total || 0);
    await connection.query(
      "UPDATE Supplies SET total_price = ? WHERE supply_id = ?",
      [totalPrice, supplyId]
    );

    await upsertTransactionForSupplyLocal(supplyId);

    await connection.query("COMMIT");

    res.status(201).json({ supply_id: supplyId, message: "Поставка успішно створена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Така деталь поставки вже існує" });
    }
    res.status(500).json({ error: "Не вдалося створити поставку", details: error.message });
  }
};

export const updateSupply = async (req, res) => {
  try {
    const { id } = req.params;
    const { supply_data_time } = req.body;
    const [result] = await db.query(
      "UPDATE Supplies SET supply_data_time = ? WHERE supply_id = ?",
      [supply_data_time, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Поставка не знайдена" });
    }
    
    const [details] = await db.query(`
      SELECT SUM(sd.quantity_grams * p.supplier_price / 1000) as total
      FROM Supply_Details sd
      JOIN Products p ON sd.product_id = p.product_id
      WHERE sd.supply_id = ?
    `, [id]);
    
    const totalPrice = parseFloat(details[0]?.total || 0);
    try {
      await db.query(
        "UPDATE Supplies SET total_price = ? WHERE supply_id = ?",
        [totalPrice, id]
      );
    } catch (updateError) {
      console.error("Could not update total_price:", updateError);
    }

    await upsertTransactionForSupplyLocal(id);
    
    res.json({ message: "Поставка успішно оновлена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити поставку" });
  }
};

export const deleteSupply = async (req, res) => {
  const connection = db;
  try {
    const { id } = req.params;
    await connection.query("START TRANSACTION");

    await connection.query("DELETE FROM Transactions WHERE supply_id = ?", [id]);

    const [result] = await connection.query("DELETE FROM Supplies WHERE supply_id = ?", [id]);
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Поставка не знайдена" });
    }

    await connection.query("COMMIT");
    res.json({ message: "Поставка успішно видалена" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }
    res.status(500).json({ error: "Не вдалося видалити поставку" });
  }
};

