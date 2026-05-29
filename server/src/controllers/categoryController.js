import db from "../config/db.js";

export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Product_categories ORDER BY product_category_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати категорії" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Product_categories WHERE product_category_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Категорія не знайдена" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати категорію" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name_product_category } = req.body;
    const [result] = await db.query(
      "INSERT INTO Product_categories (name_product_category) VALUES (?)",
      [name_product_category]
    );
    res.status(201).json({ product_category_id: result.insertId, message: "Категорія успішно створена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити категорію" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_product_category } = req.body;
    const [result] = await db.query(
      "UPDATE Product_categories SET name_product_category = ? WHERE product_category_id = ?",
      [name_product_category, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Категорія не знайдена" });
    }
    res.json({ message: "Категорія успішно оновлена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити категорію" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Product_categories WHERE product_category_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Категорія не знайдена" });
    }
    res.json({ message: "Категорія успішно видалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити категорію" });
  }
};

