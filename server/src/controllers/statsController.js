import db from "../config/db.js";

export const getDishesCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM dishes");
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};


export const getProductsCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM products");
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};


export const getRecipesCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM recipes");
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getAveragePrice = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT AVG(price_for_client) as avg_price FROM dishes"
    );
    res.json({ avg_price: parseFloat(rows[0].avg_price || 0).toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getDishesWithMostIngredients = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.dish_id, d.name, COUNT(r.product_id) as ingredient_count
      FROM dishes d
      LEFT JOIN recipes r ON d.dish_id = r.dish_id
      GROUP BY d.dish_id, d.name
      ORDER BY ingredient_count DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.product_id, p.name, p.quantity_grams, pc.name_product_category
      FROM Products p
      LEFT JOIN Product_categories pc ON p.product_category_id = pc.product_category_id
      WHERE p.quantity_grams IS NOT NULL
      ORDER BY p.quantity_grams ASC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getTopDishes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.dish_id,
        d.name,
        d.price_for_client,
        dt.dish_type_name,
        COUNT(od.order_id) as orders_count,
        SUM(od.quantity_of_dishes) as total_quantity_sold
      FROM Dishes d
      LEFT JOIN Dish_types dt ON d.dish_type_id = dt.dish_type_id
      LEFT JOIN Order_details od ON d.dish_id = od.dish_id
      GROUP BY d.dish_id, d.name, d.price_for_client, dt.dish_type_name
      ORDER BY total_quantity_sold DESC, orders_count DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getEmployeePerformance = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.employee_id,
        e.full_name,
        p.position_name,
        COUNT(DISTINCT o.order_id) as orders_handled,
        COUNT(DISTINCT DATE(o.order_date)) as working_days,
        COALESCE(SUM(d.price_for_client * od.quantity_of_dishes), 0) as total_revenue
      FROM Employees e
      LEFT JOIN Positions p ON e.position_id = p.position_id
      LEFT JOIN Orders o ON e.employee_id = o.employee_id
      LEFT JOIN Order_details od ON o.order_id = od.order_id
      LEFT JOIN Dishes d ON od.dish_id = d.dish_id
      GROUP BY e.employee_id, e.full_name, p.position_name
      ORDER BY orders_handled DESC, total_revenue DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getClientLoyalty = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.client_id,
        c.full_name,
        c.registration_date,
        COUNT(DISTINCT o.order_id) as total_orders,
        COALESCE(SUM(d.price_for_client * od.quantity_of_dishes), 0) as total_spent,
        COALESCE(AVG(d.price_for_client * od.quantity_of_dishes), 0) as avg_order_value,
        MAX(o.order_date) as last_order_date
      FROM Clients c
      LEFT JOIN Orders o ON c.client_id = o.client_id
      LEFT JOIN Order_details od ON o.order_id = od.order_id
      LEFT JOIN Dishes d ON od.dish_id = d.dish_id
      GROUP BY c.client_id, c.full_name, c.registration_date
      HAVING total_orders > 0
      ORDER BY total_spent DESC, total_orders DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

export const getProductUsage = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.product_id,
        p.name,
        pc.name_product_category,
        COUNT(DISTINCT r.dish_id) as used_in_dishes,
        COALESCE(SUM(r.quantity_grams), 0) as total_quantity_in_recipes
      FROM Products p
      LEFT JOIN Product_categories pc ON p.product_category_id = pc.product_category_id
      LEFT JOIN Recipes r ON p.product_id = r.product_id
      GROUP BY p.product_id, p.name, pc.name_product_category
      ORDER BY used_in_dishes DESC, total_quantity_in_recipes DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};


export const getAllStats = async (req, res) => {
  try {
    const [dishesCount] = await db.query("SELECT COUNT(*) as count FROM dishes");
    const [productsCount] = await db.query("SELECT COUNT(*) as count FROM products");
    const [recipesCount] = await db.query("SELECT COUNT(*) as count FROM recipes");
    const [avgPrice] = await db.query("SELECT AVG(price_for_client) as avg_price FROM dishes");
    
    res.json({
      dishes_count: dishesCount[0].count,
      products_count: productsCount[0].count,
      recipes_count: recipesCount[0].count,
      avg_price: parseFloat(avgPrice[0].avg_price || 0).toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання статистики" });
  }
};

