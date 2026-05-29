import express from "express";
import {
  getAllRecipes,
  getRecipesByDishId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  checkDishAvailability,
  autoFillRecipes
} from "../controllers/recipeController.js";

const router = express.Router();
router.get("/", getAllRecipes);
router.get("/dish/:dishId", getRecipesByDishId);
router.get("/availability", checkDishAvailability);
router.post("/", createRecipe);
router.post("/auto-fill", autoFillRecipes);
router.put("/:dishId/:productId", updateRecipe);
router.delete("/:dishId/:productId", deleteRecipe);

export default router;
