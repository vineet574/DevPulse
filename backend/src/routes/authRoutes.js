"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.default.create({
        name,
        email,
        password: hashedPassword
    });
    const token = jsonwebtoken_1.default.sign({ id: user._id }, "devpulse_secret", { expiresIn: "7d" });
    res.json({
        token,
        user
    });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User not found"
        });
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid credentials"
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, "devpulse_secret", { expiresIn: "7d" });
    res.json({
        token,
        user
    });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map