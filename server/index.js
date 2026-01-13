import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import trendsRouter from "./routes/trends.js";
import { pool } from "./db/index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.send("OK"));

app.get("/db-test", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW() as now");
  res.json(rows[0]);
});

app.use("/api/trends", trendsRouter);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
