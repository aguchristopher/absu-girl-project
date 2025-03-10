import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: String,
    position: String,
    email: String,
    phoneNumber: String,
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);
