const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  name: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ["erkak", "ayol"] },
  isPremium: { type: Boolean, default: false },
  pairedWith: { type: Number, default: null }, // Bog'langan foydalanuvchi
});

module.exports = mongoose.model("User", userSchema);
