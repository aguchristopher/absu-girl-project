import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

const formatCheckInTime = (time) => {
  if (!time) {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return time;
};

// Mark attendance
router.post("/", async (req, res) => {
  try {
    const { staffId, status, checkIn } = req.body;
    const formattedCheckIn = formatCheckInTime(checkIn);

    const attendance = new Attendance({
      staffId,
      status,
      checkIn: formattedCheckIn,
      date: new Date().toISOString().split("T")[0],
    });

    // Check for existing attendance today
    const existingAttendance = await Attendance.findOne({
      staffId,
      date: new Date().toISOString().split("T")[0],
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for today",
        checkIn: existingAttendance.checkIn,
      });
    }

    const newAttendance = await attendance.save();
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get today's attendance
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate("staffId");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
