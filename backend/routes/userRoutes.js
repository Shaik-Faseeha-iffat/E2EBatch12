const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const FoodRequest = require("../models/FoodRequest");
const verifyToken = require("../middleware/auth");


// ================= USER REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;

    if (!username || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      mobile,
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

    const user = await User.findOne({ username });

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
