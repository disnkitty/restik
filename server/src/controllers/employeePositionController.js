import db from "../config/db.js";

export const getAllEmployeePositions = async (req, res) => {
  try {
    const sql = `
      SELECT ep.*, e.full_name as employee_name, p.position_name
      FROM Employee_positions ep
      JOIN Employees e ON ep.employee_id = e.employee_id
      JOIN Positions p ON ep.position_id = p.position_id
      ORDER BY ep.employee_id, ep.position_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати посади співробітників" });
  }
};

export const getEmployeePositionsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const sql = `
      SELECT ep.*, p.position_name
      FROM Employee_positions ep
      JOIN Positions p ON ep.position_id = p.position_id
      WHERE ep.employee_id = ?
      ORDER BY ep.position_id
    `;
    const [rows] = await db.query(sql, [employeeId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати посади співробітника" });
  }
};

export const createEmployeePosition = async (req, res) => {
  try {
    const { employee_id, position_id } = req.body;
    const [result] = await db.query(
      "INSERT INTO Employee_positions (employee_id, position_id) VALUES (?, ?)",
      [employee_id, position_id]
    );
    res.status(201).json({ message: "Посада співробітника успішно створена" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Така посада співробітника вже існує" });
    }
    res.status(500).json({ error: "Не вдалося створити посаду співробітника" });
  }
};

export const deleteEmployeePosition = async (req, res) => {
  try {
    const { employeeId, positionId } = req.params;
    const [result] = await db.query(
      "DELETE FROM Employee_positions WHERE employee_id = ? AND position_id = ?",
      [employeeId, positionId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Посада співробітника не знайдена" });
    }
    res.json({ message: "Посада співробітника успішно видалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити посаду співробітника" });
  }
};

