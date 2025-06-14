import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Only require password if not a Google user (no firebaseUid)
        return !this.firebaseUid;
      },
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // <-- This is crucial!
      // Only present for Google users
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    uniqueId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
