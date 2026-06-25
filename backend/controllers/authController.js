const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email, and password." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "A user with that email already exists." });
  }

  const user = await User.create({ name, email, password });
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Enter email and password." });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken });
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Refresh token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Could not refresh token." });
  }
};

exports.profile = async (req, res) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, email: user.email });
};

exports.logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      await User.findByIdAndUpdate(decoded.id, { refreshToken: "" });
    }
  }

  res.clearCookie("refreshToken", { path: "/" });
  res.json({ message: "Logged out successfully." });
};
