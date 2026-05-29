import db from "../config/db.js";

export const getAllEmployees = async (req, res) => {
  try {
    const sql = `
      SELECT e.*, p.position_name, p.salary as position_salary
      FROM Employees e
      LEFT JOIN Positions p ON e.position_id = p.position_id
      ORDER BY e.employee_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати співробітників" });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT e.*, p.position_name, p.salary as position_salary
      FROM Employees e
      LEFT JOIN Positions p ON e.position_id = p.position_id
      WHERE e.employee_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Співробітник не знайдений" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати співробітника" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { full_name, passport, phone, age, position, employee_email, employee_address, position_id, hire_date, work_experience_years } = req.body;
    const [result] = await db.query(
      "INSERT INTO Employees (full_name, passport, phone, age, position, employee_email, employee_address, position_id, hire_date, work_experience_years) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [full_name, passport || null, phone || null, age || null, position || null, employee_email || null, employee_address || null, position_id || null, hire_date || null, work_experience_years || null]
    );
    res.status(201).json({ employee_id: result.insertId, message: "Співробітник успішно створений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити співробітника" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, passport, phone, age, position, employee_email, employee_address, position_id, hire_date, work_experience_years } = req.body;
    const [result] = await db.query(
      "UPDATE Employees SET full_name = ?, passport = ?, phone = ?, age = ?, position = ?, employee_email = ?, employee_address = ?, position_id = ?, hire_date = ?, work_experience_years = ? WHERE employee_id = ?",
      [full_name, passport || null, phone || null, age || null, position || null, employee_email || null, employee_address || null, position_id || null, hire_date || null, work_experience_years || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Співробітник не знайдений" });
    }
    res.json({ message: "Співробітник успішно оновлений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити співробітника" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Employees WHERE employee_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Співробітник не знайдений" });
    }
    res.json({ message: "Співробітник успішно видалений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити співробітника" });
  }
};

