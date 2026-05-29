import express from "express";
import {
  getAllOrderDetails,
  getOrderDetailsByOrderId,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
  replaceOrderDetails,
  checkReplacementAvailability
} from "../controllers/orderDetailController.js";

const router = express.Router();
router.get("/", getAllOrderDetails);
router.get("/order/:orderId", getOrderDetailsByOrderId);
router.post("/", createOrderDetail);
router.put("/order/:orderId", replaceOrderDetails);
router.post("/order/:orderId/availability", checkReplacementAvailability);
router.put("/:orderId/:dishId", updateOrderDetail);
router.delete("/:orderId/:dishId", deleteOrderDetail);

export default router;

