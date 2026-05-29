import express from "express";
import {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} from "../controllers/dishController.js";

const router = express.Router();
router.get("/", getAllDishes);
router.get("/:id", getDishById);
router.post("/", createDish);
router.put("/:id", updateDish);
router.delete("/:id", deleteDish);

export default router;
