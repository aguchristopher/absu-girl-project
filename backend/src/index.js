import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import staffRoutes from "./routes/staffRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/staff", staffRoutes);
app.use("/api/attendance", attendanceRoutes);

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://hyperswiftshipping:123@cluster0.5ix5kqv.mongodb.net/staff_attendance?retryWrites=true&w=majority")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
