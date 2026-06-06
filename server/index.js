import express from "express";
import cors from "cors";
import { createServer } from "http"; 
import { Server } from "socket.io";  
import db from "./src/config/db.js";
import categoriesRouter from "./src/routes/categories.js";
import suppliersRouter from "./src/routes/suppliers.js";
import productsRouter from "./src/routes/products.js";
import dishTypesRouter from "./src/routes/dishTypes.js";
import dishesRouter from "./src/routes/dishes.js";
import recipesRouter from "./src/routes/recipes.js";
import suppliesRouter from "./src/routes/supplies.js";
import supplyDetailsRouter from "./src/routes/supplyDetails.js";
import positionsRouter from "./src/routes/positions.js";
import clientsRouter from "./src/routes/clients.js";
import statusesRouter from "./src/routes/statuses.js";
import employeesRouter from "./src/routes/employees.js";
import employeePositionsRouter from "./src/routes/employeePositions.js";
import ordersRouter from "./src/routes/orders.js";
import orderDetailsRouter from "./src/routes/orderDetails.js";
import transactionsRouter from "./src/routes/transactions.js";
import queryRouter from "./src/routes/query.js";
import statsRouter from "./src/routes/stats.js";
import reportsRouter from "./src/routes/reports.js";

const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.json());
const io = new Server(server, { 
  cors: { origin: "*" } 
});
app.set("io", io);

app.use(cors());
app.use(express.json());
app.get("/restaurant", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({
      message: "Database connected",
      result: rows[0].result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database connection failed",
    });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use("/categories", categoriesRouter);
app.use("/suppliers", suppliersRouter);
app.use("/products", productsRouter);
app.use("/dishTypes", dishTypesRouter);
app.use("/dishes", dishesRouter);
app.use("/recipes", recipesRouter);
app.use("/supplies", suppliesRouter);
app.use("/supplyDetails", supplyDetailsRouter);
app.use("/positions", positionsRouter);
app.use("/clients", clientsRouter);
app.use("/statuses", statusesRouter);
app.use("/employees", employeesRouter);
app.use("/employeePositions", employeePositionsRouter);
app.use("/orders", ordersRouter);
app.use("/orderDetails", orderDetailsRouter);
app.use("/transactions", transactionsRouter);
app.use("/query", queryRouter);
app.use("/stats", statsRouter);
app.use("/reports", reportsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
