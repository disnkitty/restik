import db from "../config/db.js";

export const executeQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Запит не надано" });
    }

   
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith("SELECT")) {
      return res.status(400).json({ 
        error: "Дозволені тільки SELECT запити" 
      });
    }


    const [rows] = await db.query(query);
    
    res.json({
      success: true,
      data: rows,
      rowCount: rows.length,
    });
  } catch (error) {
    console.error("Помилка виконання запиту:", error);
    res.status(500).json({ 
      error: "Помилка виконання запиту",
      message: error.message 
    });
  }
};

