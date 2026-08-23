import express from "express";
import cors from "cors";

import connectDB from "./db/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminModel from "./models/adminModel.js";
import studentModel from "./models/studentModel.js";
import redgNo, { initRegistrationNo } from "./models/registrationNoModel.js";

const app = express();

// Connect to MongoDB
connectDB();

// Initialize registration number document
initRegistrationNo();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Server Running...");
});

// Routes
app.use("/api", studentRoutes);
app.use("/api", bookRoutes);
app.use("/api", adminRoutes);

// =====================================================
// DASHBOARD STATS
// =====================================================
app.get("/api/stats", async (req, res) => {
  try {
    const [students, books, issuedBooks] = await Promise.all([
      import("./models/studentModel.js").then((m) => m.default.countDocuments()),
      import("./models/bookModel.js").then((m) => m.default.countDocuments()),
      import("./models/studentModel.js").then((m) =>
        m.default.aggregate([
          { $project: { issueCount: { $size: { $ifNull: ["$issue", []] } } } },
          { $group: { _id: null, total: { $sum: "$issueCount" } } },
        ])
      ),
    ]);

    const totalIssued = issuedBooks[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents: students,
        totalBooks: books,
        booksIssued: totalIssued,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// CREATE DEFAULT ADMIN
// =====================================================
const DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin1234";

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await adminModel.findOne({
      email: DEFAULT_ADMIN_EMAIL,
    });

    if (!existingAdmin) {
      await adminModel.create({
        name: "Admin",
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD, // plain text (simple mode, no bcrypt)
      });

      console.log("Default admin created: admin@gmail.com / admin1234");
      return;
    }

    // Self-heal: if the stored password is stale (e.g. bcrypt hash from an
    // older version, or a wrong password), reset it to the default so login
    // (which compares plain text) works again and never returns 401.
    if (existingAdmin.password !== DEFAULT_ADMIN_PASSWORD) {
      await adminModel.updateOne(
        { _id: existingAdmin._id },
        { $set: { password: DEFAULT_ADMIN_PASSWORD } }
      );
      console.log(
        "Default admin password reset to admin1234 (stale/hashed password detected)."
      );
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.log("Admin creation error:", error.message);
  }
};

// =====================================================
// FIX LEGACY STUDENT PASSWORDS
// =====================================================
// Default student password is the DOB reversed (e.g. 2005-08-15 -> 15082005).
// Students created by an older version may have bcrypt-hashed (or otherwise
// stale) passwords that break the plain-text comparison in studentRoutes.
// Since there is no "change password" feature, repair them to the DOB default.
const fixLegacyStudentPasswords = async () => {
  try {
    const students = await studentModel.find({});

    let fixed = 0;

    for (const student of students) {
      const expectedPassword = String(student.dob).split("-").reverse().join("");

      if (student.password !== expectedPassword) {
        await studentModel.updateOne(
          { _id: student._id },
          { $set: { password: expectedPassword } }
        );
        fixed++;
      }
    }

    if (fixed > 0) {
      console.log(
        `Legacy password repair: ${fixed} student password(s) reset to DOB default.`
      );
    } else {
      console.log("All student passwords already match DOB defaults.");
    }
  } catch (error) {
    console.log("Student password repair error:", error.message);
  }
};

// =====================================================
// 404 HANDLER
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error.",
  });
});

// =====================================================
// START SERVER
// =====================================================
const PORT = 2700;

app.listen(PORT, async () => {
  console.log(`Server Running On Port ${PORT}`);
  await createDefaultAdmin();
  await fixLegacyStudentPasswords();
});

