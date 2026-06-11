import express from 'express';
import {
  getAllStats,
  getDishesCount,
  getProductsCount,
  getRecipesCount,
  getAveragePrice,
  getDishesWithMostIngredients,
  getLowStockProducts,
  getTopDishes,
  getEmployeePerformance,
  getClientLoyalty,
  getProductUsage,
  trackUserVisit,
} from '../controllers/statsController.js';

const router = express.Router();

router.get('/', getAllStats);
router.get('/visit', trackUserVisit);
router.get('/dishes', getDishesCount);
router.get('/products', getProductsCount);
router.get('/recipes', getRecipesCount);
router.get('/avg-price', getAveragePrice);
router.get('/dishes-most-ingredients', getDishesWithMostIngredients);
router.get('/low-stock', getLowStockProducts);
router.get('/top-dishes', getTopDishes);
router.get('/employee-performance', getEmployeePerformance);
router.get('/client-loyalty', getClientLoyalty);
router.get('/product-usage', getProductUsage);

export default router;
