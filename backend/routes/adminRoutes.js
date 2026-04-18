const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const FoodRequest = require('../models/FoodRequest');
const verifyToken = require('../middleware/auth');

/* Admin Login */
router.post('/login', (req, res) => {
  // Default credentials (can be overridden via environment variables)
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12';
  const jwtSecret = process.env.JWT_SECRET || 'foodconnectsecretkey';

  // Accept either username or the legacy email field for backward compatibility
  const providedUser = req.body.username || req.body.email;

  if (providedUser === adminUsername && req.body.password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '8h' });
    return res.json({ token, message: 'Admin Login Successful' });
  }

  res.status(400).json({message: 'Invalid Credentials'});
});

// All admin routes below require a valid admin token
router.use(verifyToken);

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

/* View Pending Volunteers */
router.get('/volunteers', requireAdmin, async (req, res) => {
  const volunteers = await Volunteer.find({ approved: false }).sort({ _id: -1 });
  res.json(volunteers);
});

/* View Approved Volunteers */
router.get('/approved-volunteers', requireAdmin, async (req, res) => {
  const volunteers = await Volunteer.find({ approved: true }).sort({ _id: -1 });
  res.json(volunteers);
});

/* Approve Volunteer */
router.put('/approve-volunteer/:id', requireAdmin, async (req, res) => {
  await Volunteer.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ message: "Volunteer Approved" });
});

/* Reject Volunteer */
router.put('/reject-volunteer/:id', requireAdmin, async (req, res) => {
  await Volunteer.findByIdAndUpdate(req.params.id, { approved: false, status: 'rejected' });
  res.json({ message: "Volunteer Rejected" });
});

/* View Pending Food Requests */
router.get('/requests', requireAdmin, async (req, res) => {
  const requests = await FoodRequest.find({ status: 'pending' })
    .populate('userId', 'username email')
    .sort({ createdAt: -1 });
  res.json(requests);
});

/* View Approved User Requests */
router.get('/approved-requests', requireAdmin, async (req, res) => {
  const requests = await FoodRequest.find({ status: { $in: ['approved', 'accepted', 'delivered'] } })
    .populate('userId', 'username email')
    .populate('volunteerId', 'name email')
    .sort({ createdAt: -1 });
  res.json(requests);
});

/* Approve Request */
router.put('/approve-request/:id', requireAdmin, async (req, res) => {
  await FoodRequest.findByIdAndUpdate(req.params.id, { approved: true, status: 'approved' });
  res.json({ message: "Request Approved" });
});

/* Reject Request */
router.put('/reject-request/:id', requireAdmin, async (req, res) => {
  await FoodRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.json({ message: "Request Rejected" });
});

module.exports = router;
