const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 6000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/freelancer_portfolio";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const registrationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, required: true, min: 18, max: 100 },
    mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
    email: { type: String, required: true, trim: true, lowercase: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    state: { type: String, required: true },
    skills: { type: [String], required: true }
}, { timestamps: true });

const Registration = mongoose.model("Registration", registrationSchema);

app.get("/api/health", function (req, res) {
    res.json({ success: true, message: "Freelancer Portfolio server is running." });
});

app.post("/api/register", async function (req, res) {
    try {
        const { name, password, age, mobile, email, gender, state, skills } = req.body;

        if (!name || !password || age === undefined || !mobile ||
            !email || !gender || !state || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please complete all fields and select at least one skill."
            });
        }

        if (!/^[A-Za-z ]+$/.test(name.trim())) {
            return res.status(400).json({ success: false, message: "Enter a valid name." });
        }
        if (String(password).length < 8) {
            return res.status(400).json({ success: false, message: "Password must contain at least 8 characters." });
        }
        if (!Number.isInteger(Number(age)) || Number(age) < 18 || Number(age) > 100) {
            return res.status(400).json({ success: false, message: "Age must be between 18 and 100." });
        }
        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Mobile number must contain exactly 10 digits." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const registration = await Registration.create({
            name: name.trim(),
            password: hashedPassword,
            age: Number(age),
            mobile,
            email,
            gender,
            state,
            skills
        });

        res.status(201).json({
            success: true,
            message: "Registration submitted and saved in MongoDB successfully!",
            id: registration._id
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error while saving registration." });
    }
});

app.get("/api/registrations", async function (req, res) {
    try {
        const users = await Registration.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();
        res.json(users);
    } catch (error) {
        console.error("Fetch registrations error:", error);
        res.status(500).json({ success: false, message: "Could not retrieve registrations." });
    }
});

mongoose.connect(MONGODB_URI)
    .then(function () {
        console.log("Connected to MongoDB:", MONGODB_URI);
        app.listen(PORT, function () {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(function (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });
