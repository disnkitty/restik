import express from "express";
import {
  getAllSupplyDetails,
  getSupplyDetailsBySupplyId,
  createSupplyDetail,
  updateSupplyDetail,
  deleteSupplyDetail,
} from "../controllers/supplyDetailController.js";

const router = express.Router();
router.get("/", getAllSupplyDetails);
router.get("/supply/:supplyId", getSupplyDetailsBySupplyId);
router.post("/", createSupplyDetail);
router.put("/:supplyId/:productId", updateSupplyDetail);
router.delete("/:supplyId/:productId", deleteSupplyDetail);

export default router;

