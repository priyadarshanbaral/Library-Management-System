import express from "express";
import adminModel from "../models/adminModel.js";

const router = express.Router();

// =====================================================
// ADMIN LOGIN
// =====================================================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await adminModel.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Simple plain-text password comparison (no bcrypt)
    if (password !== admin.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin login successful.",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// CREATE ADMIN (optional route for registering new admins)
// =====================================================
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingAdmin = await adminModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists.",
      });
    }

    const admin = new adminModel({
      name,
      email: email.toLowerCase().trim(),
      password, // plain text (simple mode)
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;

