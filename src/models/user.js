const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imgUrl: String,
    breed: String,
    birth: Date,
    about: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    gender: { type: String, enum: ["female", "male", "non-binary"] },
    favs: [{ type: Schema.Types.ObjectId, ref: "User" }],
    fans: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", userSchema);

module.exports = User;
