const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const FoodRequest = require("../models/FoodRequest");
const verifyToken = require("../middleware/auth");


// ================= USER REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, email, mobile, password, confirmPassword } = req.body;

    if (!username || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === normalizedUsername
          ? "Username already exists"
          : "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword
    });

    res.status(200).json({ message: "User Registered Successfully" });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= USER LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const trimmedIdentifier = identifier.trim();

    const user = await User.findOne({
      $or: [
        { username: trimmedIdentifier },
        { email: trimmedIdentifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.status(200).json({
      message: "User verified. Continue to reset your password.",
      resetToken
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "Token and passwords are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= SUBMIT FOOD (PROTECTED) =================
router.post("/submit-food", verifyToken, async (req, res) => {
  try {

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const { foodType, quantity, location } = req.body;

    if (!foodType || !quantity || !location) {
      return res.status(400).json({ message: "All food details required" });
    }

    await FoodRequest.create({
      userId: req.user.id,
      foodType,
      quantity,
      location,
      status: "pending"
    });

    res.status(200).json({
      message: "Food Submitted. Waiting for Admin Approval."
    });

  } catch (error) {
    console.error("Submit Food Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= VIEW OWN REQUESTS (PROTECTED) =================
router.get("/my-requests", verifyToken, async (req, res) => {
  try {

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const requests = await FoodRequest.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (error) {
    console.error("Fetch Requests Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
