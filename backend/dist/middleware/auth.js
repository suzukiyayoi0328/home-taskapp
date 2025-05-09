"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "mysecretkey";
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "トークンが必要です" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ トークン無効");
            res.status(403).json({ message: "トークンが無効です" });
            return;
        }
        // 🔸 デコード成功 → req.user に代入
        if (typeof decoded === "object" && decoded !== null) {
            req.user = decoded;
            console.log("✅ 認証ユーザーID:", req.user.id); // ← デバッグ用
            next();
        }
        else {
            console.log("❌ トークンデコード形式エラー");
            res.status(403).json({ message: "トークンの形式が無効です" });
        }
    });
};
exports.default = authenticateToken;
