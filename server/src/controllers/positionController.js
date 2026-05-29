import db from "../config/db.js";

export const getAllPositions = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Positions ORDER BY position_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати посади" });
  }
};

export const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Positions WHERE position_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Посада не знайдена" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати посаду" });
  }
};

export const createPosition = async (req, res) => {
  try {
    const { position_name, salary, duties_description, work_schedule, responsibility_level } = req.body;
    const [result] = await db.query(
      "INSERT INTO Positions (position_name, salary, duties_description, work_schedule, responsibility_level) VALUES (?, ?, ?, ?, ?)",
      [position_name, salary || null, duties_description || null, work_schedule || null, responsibility_level || null]
    );
    res.status(201).json({ position_id: result.insertId, message: "Посада успішно створена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити посаду" });
  }
};

export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position_name, salary, duties_description, work_schedule, responsibility_level } = req.body;
    const [result] = await db.query(
      "UPDATE Positions SET position_name = ?, salary = ?, duties_description = ?, work_schedule = ?, responsibility_level = ? WHERE position_id = ?",
      [position_name, salary || null, duties_description || null, work_schedule || null, responsibility_level || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Посада не знайдена" });
    }
    res.json({ message: "Посада успішно оновлена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити посаду" });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Positions WHERE position_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Посада не знайдена" });
    }
    res.json({ message: "Посада успішно видалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити посаду" });
  }
};

