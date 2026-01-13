import express from "express";
import { refreshAll } from "../services/refresh.js";
import { getTrendsByCategory } from "../services/trends_read.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const category = req.query.category || "tech";
  const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
  const trends = await getTrendsByCategory(category, limit);
  res.json({ category, trends });
});

router.post("/refresh", async (req, res) => {
  const summary = await refreshAll();
  res.json({ ok: true, ...summary });
});

export default router;
