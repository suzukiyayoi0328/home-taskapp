"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "mysecretkey"; // ✅ 共通化！
const authenticateToken = (req, res, next) => {
    console.log("🔥 authenticateToken 発動 in middleware/auth.ts"); // ログ確認！
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log("🎫 トークン:", token);
    if (!token) {
        console.log("🚫 トークン無し");
        res.status(401).json({ message: "トークンが必要です" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ トークン無効");
            res.status(403).json({ message: "トークンが無効です" });
            return;
        }
        if (typeof decoded === "object" && decoded !== null) {
            console.log("✅ トークン認証成功:", decoded);
            req.user = decoded; // ✅ 型を断言！
            next();
        }
        else {
            console.log("❌ トークンデコード形式エラー");
            res.status(403).json({ message: "トークンの形式が無効です" });
        }
    });
};
exports.authenticateToken = authenticateToken;
