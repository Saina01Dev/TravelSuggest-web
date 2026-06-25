require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("TravelSuggest Pro Backend is Running 🚀");
});

// Logging middleware BEFORE routes
app.use((req, res, next) => {
  console.log(`[BEFORE ROUTES] ${req.method} ${req.path} - Body:`, req.body);
  next();
});

console.log("Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
console.log("Routes set up complete");

// Logging middleware AFTER routes
app.use((req, res, next) => {
  console.log(`[AFTER ROUTES] ${req.method} ${req.path}`);
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});