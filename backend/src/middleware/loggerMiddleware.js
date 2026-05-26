"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../socket");
const ApiLog_1 = __importDefault(require("../models/ApiLog"));
const loggerMiddleware = async (req, res, next) => {
    const start = Date.now();
    res.on("finish", async () => {
        const responseTime = Date.now() - start;
        const newLog = await ApiLog_1.default.create({
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            responseTime
        });
        socket_1.io.emit("new-log", newLog);
        console.log({
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            responseTime
        });
    });
    next();
};
exports.default = loggerMiddleware;
//# sourceMappingURL=loggerMiddleware.js.map