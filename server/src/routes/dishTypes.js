import express from "express";
import {
  getAllDishTypes,
  getDishTypeById,
  createDishType,
  updateDishType,
  deleteDishType,
} from "../controllers/dishTypeController.js";

const router = express.Router();
router.get("/", getAllDishTypes);
router.get("/:id", getDishTypeById);
router.post("/", createDishType);
router.put("/:id", updateDishType);
router.delete("/:id", deleteDishType);

export default router;

