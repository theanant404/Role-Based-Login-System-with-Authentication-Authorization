"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.ORIGIN,
    credentials: true
}));
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || 'unknown';
    },
    handler: (req, res) => {
        res.status(429).send('Too many requests, please try again later');
    }
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use(express_1.default.static('public'));
app.use((0, cookie_parser_1.default)());
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
app.use("/auth/", authRoutes_1.default);
app.use(auth_middleware_1.JwtVerify);
app.use("/dashboard/", dashboardRoutes_1.default);
exports.default = app;
