import db from "../config/db.js";

export const getAllStatuses = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Statuses ORDER BY status_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати статуси" });
  }
};

export const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Statuses WHERE status_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Статус не знайдений" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати статус" });
  }
};

export const createStatus = async (req, res) => {
  try {
    const { status_name } = req.body;
    const [result] = await db.query(
      "INSERT INTO Statuses (status_name) VALUES (?)",
      [status_name]
    );
    res.status(201).json({ status_id: result.insertId, message: "Статус успішно створений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити статус" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_name } = req.body;
    const [result] = await db.query(
      "UPDATE Statuses SET status_name = ? WHERE status_id = ?",
      [status_name, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Статус не знайдений" });
    }
    res.json({ message: "Статус успішно оновлений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити статус" });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Statuses WHERE status_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Статус не знайдений" });
    }
    res.json({ message: "Статус успішно видалений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити статус" });
  }
};

