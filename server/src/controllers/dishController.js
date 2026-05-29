import db from "../config/db.js";

export const getAllDishes = async (req, res) => {
  try {
    const sql = `
      SELECT d.*, dt.dish_type_name 
      FROM Dishes d
      LEFT JOIN Dish_types dt ON d.dish_type_id = dt.dish_type_id
      ORDER BY d.dish_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати список блюд" });
  }
};

export const getDishById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT d.*, dt.dish_type_name 
      FROM Dishes d
      LEFT JOIN Dish_types dt ON d.dish_type_id = dt.dish_type_id
      WHERE d.dish_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Блюдо не знайдено" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати блюдо" });
  }
};

export const createDish = async (req, res) => {
  try {
    const { name, weight_grams, price_for_client, recipe_description, dish_type_id, preparation_time_minutes, calories } = req.body;
    const [result] = await db.query(
      "INSERT INTO Dishes (name, weight_grams, price_for_client, recipe_description, dish_type_id, preparation_time_minutes, calories) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, weight_grams || null, price_for_client || null, recipe_description || null, dish_type_id || null, preparation_time_minutes || null, calories || null]
    );
    res.status(201).json({ dish_id: result.insertId, message: "Блюдо успішно створено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити блюдо" });
  }
};

export const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, weight_grams, price_for_client, recipe_description, dish_type_id, preparation_time_minutes, calories } = req.body;
    const [result] = await db.query(
      "UPDATE Dishes SET name = ?, weight_grams = ?, price_for_client = ?, recipe_description = ?, dish_type_id = ?, preparation_time_minutes = ?, calories = ? WHERE dish_id = ?",
      [name, weight_grams || null, price_for_client || null, recipe_description || null, dish_type_id || null, preparation_time_minutes || null, calories || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Блюдо не знайдено" });
    }
    res.json({ message: "Блюдо успішно оновлено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити блюдо" });
  }
};

export const deleteDish = async (req, res) => {
  const connection = db;
  try {
    const { id } = req.params;
    await connection.query("START TRANSACTION");

    await connection.query("DELETE FROM Recipes WHERE dish_id = ?", [id]);

    const [result] = await connection.query("DELETE FROM Dishes WHERE dish_id = ?", [id]);
    if (result.affectedRows === 0) {
      await connection.query("ROLLBACK");
      return res.status(404).json({ error: "Блюдо не знайдено" });
    }

    await connection.query("COMMIT");
    res.json({ message: "Блюдо та его рецепты успішно видалено" });
  } catch (error) {
    console.error(error);
    try {
      await connection.query("ROLLBACK");
    } catch (e) {
      console.error("Rollback error:", e);
    }

    if (error && error.code && (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED")) {
      return res.status(400).json({ error: "Неможливо видалити блюдо: воно використовується в існуючих замовленнях" });
    }

    res.status(500).json({ error: "Не вдалося видалити блюдо" });
  }
};
