import express from "express";
import {
  getAllEmployeePositions,
  getEmployeePositionsByEmployeeId,
  createEmployeePosition,
  deleteEmployeePosition,
} from "../controllers/employeePositionController.js";

const router = express.Router();
router.get("/", getAllEmployeePositions);
router.get("/employee/:employeeId", getEmployeePositionsByEmployeeId);
router.post("/", createEmployeePosition);
router.delete("/:employeeId/:positionId", deleteEmployeePosition);

export default router;

