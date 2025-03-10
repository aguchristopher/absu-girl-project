import express from "express";
import Staff from "../models/Staff.js";

const router = express.Router();

// Get all staff
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create staff
router.post("/", async (req, res) => {
  const staff = new Staff(req.body);
  try {
    const newStaff = await staff.save();
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete staff
router.delete("/:id", async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
