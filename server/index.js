import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import trendsRouter from "./routes/trends.js";
import { pool } from "./db/index.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

//API status route
app.get("/", (req, res) => {
  res.send("Trend Arbitrage API running");
});

// quick test route
app.get("/health", (req, res) => res.send("OK"));

// test DB connection
app.get("/db-test", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW() AS now");
  res.json(rows[0]);
});

// trends API routes
app.use("/api/trends", trendsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
