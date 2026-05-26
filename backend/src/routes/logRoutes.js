"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const ApiLog_1 = __importDefault(require("../models/ApiLog"));
const router = express_1.default.Router();
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res
            .status(401)
            .json({
            message: "No token"
        });
    }
    try {
        jsonwebtoken_1.default.verify(token, "secretkey");
        next();
    }
    catch {
        return res
            .status(403)
            .json({
            message: "Invalid token"
        });
    }
};
router.get("/", verifyToken, async (req, res) => {
    const logs = await ApiLog_1.default.find().sort({ createdAt: -1 });
    res.json(logs);
});
exports.default = router;
//# sourceMappingURL=logRoutes.js.map