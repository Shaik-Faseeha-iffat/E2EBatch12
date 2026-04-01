const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  email: { type: String, required: true, trim: true, lowercase: true },
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
  gender: { type: String, trim: true },
  organizationType: { type: String, required: true },
  organizationDetails: { type: String, default: "" },
  approved: { type: Boolean, default: false },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
