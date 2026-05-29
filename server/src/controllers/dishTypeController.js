import db from "../config/db.js";

export const getAllDishTypes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Dish_types ORDER BY dish_type_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати типи страв" });
  }
};

export const getDishTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Dish_types WHERE dish_type_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Тип страви не знайдений" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати тип страви" });
  }
};

export const createDishType = async (req, res) => {
  try {
    const { dish_type_name, description } = req.body;
    const [result] = await db.query(
      "INSERT INTO Dish_types (dish_type_name, description) VALUES (?, ?)",
      [dish_type_name, description || null]
    );
    res.status(201).json({ dish_type_id: result.insertId, message: "Тип страви успішно створений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити тип страви" });
  }
};

export const updateDishType = async (req, res) => {
  try {
    const { id } = req.params;
    const { dish_type_name, description } = req.body;
    const [result] = await db.query(
      "UPDATE Dish_types SET dish_type_name = ?, description = ? WHERE dish_type_id = ?",
      [dish_type_name, description || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Тип страви не знайдений" });
    }
    res.json({ message: "Тип страви успішно оновлений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити тип страви" });
  }
};

export const deleteDishType = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Dish_types WHERE dish_type_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Тип страви не знайдений" });
    }
    res.json({ message: "Тип страви успішно видалений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити тип страви" });
  }
};

