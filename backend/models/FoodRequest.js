const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
  foodType: String,
  quantity: String,
  location: String,
  approved: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'accepted', 'delivered'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model("FoodRequest", foodRequestSchema);
