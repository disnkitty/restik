import db from "../config/db.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Suppliers ORDER BY supplier_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати постачальників" });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Suppliers WHERE supplier_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Постачальник не знайдений" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати постачальника" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { full_name, phone, city, supplier_email, supplier_address } = req.body;
    const [result] = await db.query(
      "INSERT INTO Suppliers (full_name, phone, city, supplier_email, supplier_address) VALUES (?, ?, ?, ?, ?)",
      [full_name, phone || null, city || null, supplier_email || null, supplier_address || null]
    );
    res.status(201).json({ supplier_id: result.insertId, message: "Постачальник успішно створений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося створити постачальника" });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, city, supplier_email, supplier_address } = req.body;
    const [result] = await db.query(
      "UPDATE Suppliers SET full_name = ?, phone = ?, city = ?, supplier_email = ?, supplier_address = ? WHERE supplier_id = ?",
      [full_name, phone || null, city || null, supplier_email || null, supplier_address || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Постачальник не знайдений" });
    }
    res.json({ message: "Постачальник успішно оновлений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити постачальника" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Suppliers WHERE supplier_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Постачальник не знайдений" });
    }
    res.json({ message: "Постачальник успішно видалений" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити постачальника" });
  }
};

