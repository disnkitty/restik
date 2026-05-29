import db from "../config/db.js";

export const getAllRecipes = async (req, res) => {
  try {
    const sql = `
      SELECT r.dish_id, r.product_id, d.name as dish_name, p.name as product_name, r.quantity_grams 
      FROM Recipes r
      JOIN Dishes d ON r.dish_id = d.dish_id
      JOIN Products p ON r.product_id = p.product_id
      ORDER BY r.dish_id, r.product_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати рецепти" });
  }
};

export const getRecipesByDishId = async (req, res) => {
  try {
    const { dishId } = req.params;
    const sql = `
      SELECT r.dish_id, r.product_id, d.name as dish_name, p.name as product_name, r.quantity_grams 
      FROM Recipes r
      JOIN Dishes d ON r.dish_id = d.dish_id
      JOIN Products p ON r.product_id = p.product_id
      WHERE r.dish_id = ?
      ORDER BY r.product_id
    `;
    const [rows] = await db.query(sql, [dishId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося отримати рецепти для блюда" });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const { dish_id, product_id, quantity_grams } = req.body;
    const [result] = await db.query(
      "INSERT INTO Recipes (dish_id, product_id, quantity_grams) VALUES (?, ?, ?)",
      [dish_id, product_id, quantity_grams]
    );
    res.status(201).json({ message: "Рецепт успішно створено" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Такий рецепт вже існує" });
    }
    res.status(500).json({ error: "Не вдалося створити рецепт" });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { dishId, productId } = req.params;
    const { quantity_grams } = req.body;
    const [result] = await db.query(
      "UPDATE Recipes SET quantity_grams = ? WHERE dish_id = ? AND product_id = ?",
      [quantity_grams, dishId, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }
    res.json({ message: "Рецепт успішно оновлено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося оновити рецепт" });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { dishId, productId } = req.params;
    const [result] = await db.query(
      "DELETE FROM Recipes WHERE dish_id = ? AND product_id = ?",
      [dishId, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }
    res.json({ message: "Рецепт успішно видалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не вдалося видалити рецепт" });
  }
};

export const checkDishAvailability = async (req, res) => {
  try {
    const dishId = parseInt(req.query.dishId);
    const qty = parseFloat(req.query.qty) || 1;
    if (!dishId) return res.status(400).json({ error: "dishId required" });

    const [recipes] = await db.query("SELECT r.product_id, r.quantity_grams, p.name, COALESCE(p.quantity_grams,0) as available FROM Recipes r JOIN Products p ON r.product_id = p.product_id WHERE r.dish_id = ?", [dishId]);

    const shortages = [];
    for (const r of recipes) {
      const need = (r.quantity_grams || 0) * qty;
      if (r.available < need) {
        shortages.push({ product_id: r.product_id, product_name: r.name, required: need, available: r.available });
      }
    }

    res.json({ available: shortages.length === 0, shortages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка перевірки доступності" });
  }
};

export const autoFillRecipes = async (req, res) => {
  try {
   
    const [dishesWithout] = await db.query(`SELECT dish_id FROM Dishes WHERE dish_id NOT IN (SELECT DISTINCT dish_id FROM Recipes)`);
    if (dishesWithout.length === 0) return res.json({ created: 0 });

    const [products] = await db.query(`SELECT product_id FROM Products`);
    if (products.length === 0) return res.status(400).json({ error: 'No products to assign' });

    let created = 0;
    for (const d of dishesWithout) {
      const count = Math.min(3, products.length);

      for (let i = 0; i < count; i++) {
        const p = products[(d.dish_id + i) % products.length];
        const qty = 50 + ((d.dish_id + i) % 4) * 50; 
        try {
          await db.query("INSERT INTO Recipes (dish_id, product_id, quantity_grams) VALUES (?, ?, ?)", [d.dish_id, p.product_id, qty]);
          created++;
        } catch (e) {

        }
      }
    }

    res.json({ created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Auto-fill failed' });
  }
};
