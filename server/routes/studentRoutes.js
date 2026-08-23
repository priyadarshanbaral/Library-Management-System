import express from "express";
import studentModel from "../models/studentModel.js";
import redgNo from "../models/registrationNoModel.js";

const router = express.Router();

// =====================================================
// STUDENT LOGIN
// =====================================================
router.post("/student/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const student = await studentModel.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Simple plain-text password comparison (no bcrypt)
    if (password !== student.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student login successful.",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        regd_no: student.regd_no,
        mobile: student.mobile,
        dob: student.dob,
      },
    });
  } catch (err) {
    console.error("Student Login Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// GET ALL STUDENTS
// =====================================================
router.get("/students", async (req, res) => {
  try {
    const students = await studentModel.find({});
    return res.status(200).json({
      success: true,
      message: "Students fetched successfully.",
      data: students,
    });
  } catch (err) {
    console.error("Get Students Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// ADD STUDENT
// =====================================================
router.post("/addstudents", async (req, res) => {
  try {
    const { name, email, dob, mobile } = req.body;

    if (!name || !email || !dob || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const emailExist = await studentModel.findOne({ email: cleanEmail });

    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const reg = await redgNo.findOne();

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "Registration number document not found.",
      });
    }

    // Default password = DOB reversed e.g. 2005-08-15 -> 15082005
    const defaultPassword = dob.split("-").reverse().join("");

    const student = new studentModel({
      name: name.trim(),
      email: cleanEmail,
      dob,
      mobile,
      regd_no: reg.registration_no,
      password: defaultPassword, // plain text (simple mode)
      issue: [],
      submit: [],
    });

    await student.save();

    // Increase registration number for next student
    await redgNo.updateOne(
      { _id: reg._id },
      { $inc: { registration_no: 1 } }
    );

    return res.status(201).json({
      success: true,
      message: "Student added successfully.",
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        dob: student.dob,
        mobile: student.mobile,
        regd_no: student.regd_no,
        defaultPassword,
      },
    });
  } catch (err) {
    console.error("Add Student Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// DELETE STUDENT
// =====================================================
router.delete("/deletestudent", async (req, res) => {
  try {
    const { name, email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const student = await studentModel.findOne({ email: cleanEmail });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    await studentModel.deleteOne({ email: cleanEmail });

    return res.status(200).json({
      success: true,
      message: `Student ${name || student.name} deleted successfully.`,
    });
  } catch (err) {
    console.error("Delete Student Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;

