import express from "express";
import {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getDashboardStats,
} from "../controllers/leaveController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, applyLeave);
router.get("/", authMiddleware, getLeaves);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("MANAGER", "ADMIN"),
  updateLeaveStatus,
);

router.get("/dashboard", authMiddleware, getDashboardStats);

export default router;
