import express from "express"
import cors from "cors";
import authRoutes from "./routes/auth.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import miscExpRouter from "./routes/miscExproutes.js";

//database
import { connectDB } from "./db/db.js";
connectDB()

const app=express()
app.use(express.json());

const PORT = process.env.PORT;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/users", authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/miscexp', miscExpRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).send({
      success: false,
      statusCode,
      message,
    });
  });
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  