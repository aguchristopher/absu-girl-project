import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
    checkIn: String,
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
