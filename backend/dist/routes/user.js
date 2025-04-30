"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("🚀 userルーターが読み込まれた！");
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const router = express_1.default.Router();
// GET /me → ログイン中ユーザーの email と username を返す
router.get("/me", auth_1.authenticateToken, (req, res) => {
    console.log("📡 /me エンドポイントにリクエストあり"); // ★ ここ追加
    const user = req.user; // 型は自動で JwtPayload
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        console.log("🚫 トークンには email が入っていない！"); // ★ ここ追加
        return res
            .status(400)
            .json({ message: "メールアドレスが取得できませんでした" });
    }
    console.log("🔑 トークン内 email:", user.email); // ★ ここ追加
    const sql = "SELECT email, username FROM users202504171 WHERE email = ?";
    db_1.db.query(sql, [user.email], (err, results) => {
        if (err) {
            console.error("ユーザー情報取得失敗:", err);
            return res
                .status(500)
                .json({ message: "ユーザー情報の取得に失敗しました" });
        }
        const rows = results;
        console.log("🔍 DBから取得したユーザー情報:", rows); // ★ ここ追加
        if (rows.length === 0) {
            console.log("⚠️ DBにユーザーが見つからない！");
            return res.status(404).json({ message: "ユーザーが見つかりません" });
        }
        const userData = rows[0];
        console.log("✅ レスポンス返却:", userData); // ★ ここ追加
        res.json({ email: userData.email, username: userData.username });
    });
});
// PUT /update-username → ユーザー名変更
router.put("/update-username", auth_1.authenticateToken, (req, res) => {
    const user = req.user;
    const { username } = req.body;
    if (!username || username.trim() === "") {
        return res.status(400).json({ message: "ユーザー名を入力してください" });
    }
    const sql = "UPDATE users202504171 SET username = ? WHERE email = ?";
    db_1.db.query(sql, [username, user.email], (err) => {
        if (err) {
            console.error("ユーザー名更新失敗:", err);
            return res.status(500).json({ message: "更新に失敗しました" });
        }
        res.json({ message: "ユーザー名を更新しました！" });
    });
});
exports.default = router;
