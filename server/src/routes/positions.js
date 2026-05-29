import express from "express";
import {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from "../controllers/positionController.js";

const router = express.Router();
router.get("/", getAllPositions);
router.get("/:id", getPositionById);
router.post("/", createPosition);
router.put("/:id", updatePosition);
router.delete("/:id", deletePosition);

export default router;

