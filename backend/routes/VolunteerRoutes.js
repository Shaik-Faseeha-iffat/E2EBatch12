const router = require('express').Router();
const Volunteer = require('../models/Volunteer');
const FoodRequest = require('../models/FoodRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

/* Register */
router.post('/register', async (req, res) => {
  try {
    const { name, gender, phone, email, password, organizationType, organizationDetails } = req.body;

    if (!name || !phone || !email || !password || !organizationType) {
      return res.status(400).json({ message: "Please fill all required volunteer details" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingVolunteer = await Volunteer.findOne({ email: normalizedEmail });

    if (existingVolunteer) {
      return res.status(400).json({ message: "Volunteer already registered with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Volunteer.create({
      name: name.trim(),
      gender: gender ? gender.trim() : "",
      phone: phone.trim(),
      email: normalizedEmail,
      password: hashed,
      organizationType,
      organizationDetails: organizationDetails || "",
      approved: false
    });

    res.json({ message: "Volunteer Registered. Awaiting Admin Approval" });
  } catch (error) {
    console.error("Volunteer Register Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* Login */
router.post('/login', async (req, res) => {
  const normalizedEmail = (req.body.email || '').trim().toLowerCase();
  const volunteer = await Volunteer.findOne({ email: normalizedEmail });
  if (!volunteer) return res.status(400).json({message: "Volunteer not found"});

  const valid = await bcrypt.compare(req.body.password, volunteer.password);
  if (!valid) return res.status(400).json({message: "Invalid password"});

  if (!volunteer.approved)
    return res.status(403).json({message: "Waiting for Admin Approval"});

  const token = jwt.sign(
    { id: volunteer._id, role: "volunteer" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, message: "Login Successful" });
});

/* View Approved Requests */
router.get('/approved-requests', verifyToken, async (req, res) => {
  if (req.user.role !== "volunteer") return res.status(403).json({message: "Access Denied"});

  const requests = await FoodRequest.find({ status: 'approved' })
    .populate('userId', 'username email mobile')
    .sort({ createdAt: -1 });

  res.json(requests);
});

/* Accept Request */
router.put('/accept-request/:id', verifyToken, async (req, res) => {
  if (req.user.role !== "volunteer") return res.status(403).json({message: "Access Denied"});

  const request = await FoodRequest.findById(req.params.id);
  if (!request || request.status !== 'approved') {
    return res.status(400).json({message: "Request not available"});
  }

  await FoodRequest.findByIdAndUpdate(req.params.id, {
    volunteerId: req.user.id,
    status: 'accepted'
  });

  res.json({message: "Request accepted successfully"});
});

/* View My Accepted Requests */
router.get('/my-deliveries', verifyToken, async (req, res) => {
  if (req.user.role !== "volunteer") return res.status(403).json({message: "Access Denied"});

  const requests = await FoodRequest.find({
    volunteerId: req.user.id,
    status: { $in: ['accepted', 'delivered'] }
  })
    .populate('userId', 'username email mobile')
    .sort({ createdAt: -1 });

  res.json(requests);
});

/* Mark as Delivered */
router.put('/mark-delivered/:id', verifyToken, async (req, res) => {
  if (req.user.role !== "volunteer") return res.status(403).json({message: "Access Denied"});

  const request = await FoodRequest.findById(req.params.id);
  if (!request || request.volunteerId.toString() !== req.user.id) {
    return res.status(403).json({message: "Access Denied"});
  }

  await FoodRequest.findByIdAndUpdate(req.params.id, { status: 'delivered' });
  res.json({message: "Marked as delivered"});
});

module.exports = router;
