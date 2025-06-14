import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from '../firebase/admin.js'; // your firebase-admin setup

// Password validation function
const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
  return regex.test(password);
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters, include a number and a special character." });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ user: { name: user.name, email: user.email, _id: user._id }, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ user: { name: user.name, email: user.email, _id: user._id }, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Verify the ID token from the client
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'No email in token' });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || '',
        avatar: picture || '',
        provider: 'google',
        uniqueId: uid,
      });
    }

    // Optionally, generate your own JWT for session management here
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    // Respond with user info
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        uniqueId: uid,
      },
      token: jwtToken
    });
  } catch (error) {
    // Log for debugging
    return res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
};