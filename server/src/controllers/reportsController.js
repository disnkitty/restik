import db from "../config/db.js";

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `
      SELECT 
        o.order_id,
        o.order_date,
        c.full_name as client_name,
        s.status_name,
        SUM(d.price_for_client * od.quantity_of_dishes) as total_amount,
        COUNT(od.dish_id) as dishes_count
      FROM Orders o
      LEFT JOIN Clients c ON o.client_id = c.client_id
      LEFT JOIN Statuses s ON o.status_id = s.status_id
      LEFT JOIN Order_details od ON o.order_id = od.order_id
      LEFT JOIN Dishes d ON od.dish_id = d.dish_id
      WHERE 1=1
    `;
    const params = [];
    if (startDate) {
      sql += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND o.order_date <= ?";
      params.push(endDate);
    }
    sql += " GROUP BY o.order_id, o.order_date, c.full_name, s.status_name ORDER BY o.order_date DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання звіту про продажі" });
  }
};

export const getClientOrderReport = async (req, res) => {
  try {
    const { clientId } = req.params;
    const sql = `
      SELECT 
        c.full_name as client_name,
        c.phone,
        c.email,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(d.price_for_client * od.quantity_of_dishes) as total_spent,
        AVG(d.price_for_client * od.quantity_of_dishes) as avg_order_value,
        MAX(o.order_date) as last_order_date
      FROM Clients c
      LEFT JOIN Orders o ON c.client_id = o.client_id
      LEFT JOIN Order_details od ON o.order_id = od.order_id
      LEFT JOIN Dishes d ON od.dish_id = d.dish_id
      WHERE c.client_id = ?
      GROUP BY c.client_id, c.full_name, c.phone, c.email
    `;
    const [rows] = await db.query(sql, [clientId]);
    res.json(rows[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання звіту по клієнту" });
  }
};



export const getSupplyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `
      SELECT 
        s.supply_id,
        s.supply_data_time,
        COUNT(sd.product_id) as products_count,
        SUM(sd.quantity_grams) as total_quantity,
        SUM(p.supplier_price * sd.quantity_grams / 1000) as total_cost
      FROM Supplies s
      LEFT JOIN Supply_Details sd ON s.supply_id = sd.supply_id
      LEFT JOIN Products p ON sd.product_id = p.product_id
      WHERE 1=1
    `;
    const params = [];
    if (startDate) {
      sql += " AND s.supply_data_time >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND s.supply_data_time <= ?";
      params.push(endDate);
    }
    sql += " GROUP BY s.supply_id, s.supply_data_time ORDER BY s.supply_data_time DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання звіту про поставки" });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `
      SELECT 
        'Доходи' as type,
        SUM(t.amount) as total,
        COUNT(t.transaction_id) as count
      FROM Transactions t
      WHERE t.order_id IS NOT NULL
    `;
    const params = [];
    if (startDate) {
      sql += " AND t.transaction_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND t.transaction_date <= ?";
      params.push(endDate);
    }
    sql += `
      UNION ALL
      SELECT 
        'Витрати' as type,
        SUM(t.amount) as total,
        COUNT(t.transaction_id) as count
      FROM Transactions t
      WHERE t.supply_id IS NOT NULL
    `;
    if (startDate) {
      sql += " AND t.transaction_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND t.transaction_date <= ?";
      params.push(endDate);
    }
    const [rows] = await db.query(sql, [...params, ...params]);
    const income = rows.find(r => r.type === 'Доходи') || { total: 0, count: 0 };
    const expenses = rows.find(r => r.type === 'Витрати') || { total: 0, count: 0 };
    const profit = parseFloat(income.total || 0) - parseFloat(expenses.total || 0);
    res.json({
      income: parseFloat(income.total || 0).toFixed(2),
      expenses: parseFloat(expenses.total || 0).toFixed(2),
      profit: profit.toFixed(2),
      income_count: income.count,
      expenses_count: expenses.count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання фінансового звіту" });
  }
};









export const getOrderCheck = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sql = `
      SELECT 
        o.order_id,
        o.order_date,
        c.full_name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        e.full_name as employee_name,
        s.status_name,
        o.delivery_address,
        d.name as dish_name,
        d.price_for_client,
        od.quantity_of_dishes,
        (d.price_for_client * od.quantity_of_dishes) as item_total,
        od.note
      FROM Orders o
      LEFT JOIN Clients c ON o.client_id = c.client_id
      LEFT JOIN Employees e ON o.employee_id = e.employee_id
      LEFT JOIN Statuses s ON o.status_id = s.status_id
      LEFT JOIN Order_details od ON o.order_id = od.order_id
      LEFT JOIN Dishes d ON od.dish_id = d.dish_id
      WHERE o.order_id = ?
      ORDER BY od.dish_id
    `;
    const [rows] = await db.query(sql, [orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Замовлення не знайдене" });
    }
    const orderInfo = {
      order_id: rows[0].order_id,
      order_date: rows[0].order_date,
      client_name: rows[0].client_name,
      client_phone: rows[0].client_phone,
      client_email: rows[0].client_email,
      employee_name: rows[0].employee_name,
      status_name: rows[0].status_name,
      delivery_address: rows[0].delivery_address,
      restaurant_address: "Харків, вулиця Наукова",
      items: rows.map(r => ({
        dish_name: r.dish_name,
        price: r.price_for_client,
        quantity: r.quantity_of_dishes,
        item_total: r.item_total,
        note: r.note
      })),
      total: rows.reduce((sum, r) => sum + parseFloat(r.item_total || 0), 0).toFixed(2)
    };
    res.json(orderInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Помилка отримання чека" });
  }
};







