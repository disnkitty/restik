import db from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const sql = `
      SELECT p.*, s.full_name as supplier_name, pc.name_product_category 
      FROM Products p
      LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
      LEFT JOIN Product_categories pc ON p.product_category_id = pc.product_category_id
      ORDER BY p.product_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати список продуктів" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT p.*, s.full_name as supplier_name, pc.name_product_category 
      FROM Products p
      LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
      LEFT JOIN Product_categories pc ON p.product_category_id = pc.product_category_id
      WHERE p.product_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Продукт не знайдено" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати продукт" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      quantity_grams,
      supplier_id,
      supplier_price,
      product_category_id,
    } = req.body;
    const [result] = await db.query(
      "INSERT INTO Products (name, quantity_grams, supplier_id, supplier_price, product_category_id) VALUES (?, ?, ?, ?, ?)",
      [
        name,
        quantity_grams || null,
        supplier_id || null,
        supplier_price || null,
        product_category_id || null,
      ]
    );
    res.status(201).json({
      product_id: result.insertId,
      message: "Продукт успішно створено",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити продукт" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantity_grams,
      supplier_id,
      supplier_price,
      product_category_id,
    } = req.body;
    const [result] = await db.query(
      "UPDATE Products SET name = ?, quantity_grams = ?, supplier_id = ?, supplier_price = ?, product_category_id = ? WHERE product_id = ?",
      [
        name,
        quantity_grams || null,
        supplier_id || null,
        supplier_price || null,
        product_category_id || null,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Продукт не знайдено" });
    }
    res.json({ message: "Продукт успішно оновлено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити продукт" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM Products WHERE product_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Продукт не знайдено" });
    }
    res.json({ message: "Продукт успішно видалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити продукт" });
  }
};
