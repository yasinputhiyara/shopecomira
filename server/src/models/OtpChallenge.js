import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["register"],
      default: "register",
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    payload: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      passwordHash: { type: String, required: true },
    },
  },
  { timestamps: true }
);

otpChallengeSchema.index({ email: 1, purpose: 1 }, { unique: true });

const OtpChallenge = mongoose.model("OtpChallenge", otpChallengeSchema);
export default OtpChallenge;
