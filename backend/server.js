const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());


// ================= DATABASE CONNECTION =================
const mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

if (!mongoUri) {
  console.error("MongoDB Connection Error: MONGO_URI is not defined. Please set it in your .env file or environment.");
  process.exit(1);
}

mongoose.set("strictQuery", true);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message || error);
    console.error("Full Error:", error);
    process.exit(1);
  });


// ================= ROUTES =================
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/volunteer", require("./routes/volunteerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("FoodConnect Backend Running...");
});


// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing server process and try again.`);
    process.exit(1);
  }

  console.error("Server startup error:", error.message || error);
  process.exit(1);
});
