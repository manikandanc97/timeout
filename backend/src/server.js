import "dotenv/config";
import express from "express";
import prisma from "./prismaClient.js";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

import leaveRoutes from "./routes/leaveRoutes.js";

import cookieParser from "cookie-parser";
import {
  getLeaveHistory,
  getUpcomingHolidays,
} from "./controllers/leaveController.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.use("/api/auth", authRoutes);

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.use("/api/leaves", leaveRoutes);

app.get("/api/history", authMiddleware, getLeaveHistory);

app.get("/api/holidays", authMiddleware, getUpcomingHolidays);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
