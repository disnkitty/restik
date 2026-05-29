import db from "../config/db.js";

export const getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Clients ORDER BY client_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати клієнтів" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Clients WHERE client_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Клієнт не знайдений" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати клієнта" });
  }
};

export const createClient = async (req, res) => {
  try {
    const { full_name, phone, email, registration_date } = req.body;
    const [result] = await db.query(
      "INSERT INTO Clients (full_name, phone, email, registration_date) VALUES (?, ?, ?, ?)",
      [full_name, phone || null, email || null, registration_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ client_id: result.insertId, message: "Клієнт успішно створений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити клієнта" });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, registration_date } = req.body;
    const [result] = await db.query(
      "UPDATE Clients SET full_name = ?, phone = ?, email = ?, registration_date = ? WHERE client_id = ?",
      [full_name, phone || null, email || null, registration_date || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Клієнт не знайдений" });
    }
    res.json({ message: "Клієнт успішно оновлений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити клієнта" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Clients WHERE client_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Клієнт не знайдений" });
    }
    res.json({ message: "Клієнт успішно видалений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити клієнта" });
  }
};

