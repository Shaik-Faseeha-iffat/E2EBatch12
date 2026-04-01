const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  mobile: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  password: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 6 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
      },
      message: 'Password must be at least 6 characters with at least one special character'
    }
  },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
