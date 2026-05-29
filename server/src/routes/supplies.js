import express from "express";
import {
  getAllSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
} from "../controllers/supplyController.js";

const router = express.Router();
router.get("/", getAllSupplies);
router.get("/:id", getSupplyById);
router.post("/", createSupply);
router.put("/:id", updateSupply);
router.delete("/:id", deleteSupply);

export default router;

