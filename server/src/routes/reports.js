import express from "express";
import {
  getSalesReport,
  getClientOrderReport,
  getSupplyReport,
  getFinancialReport,
  getOrderCheck
} from "../controllers/reportsController.js";

const router = express.Router();

router.get("/sales", getSalesReport);
router.get("/client/:clientId", getClientOrderReport);
router.get("/supplies", getSupplyReport);
router.get("/financial", getFinancialReport);
router.get("/check/:orderId", getOrderCheck);

export default router;

