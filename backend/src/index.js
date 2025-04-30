"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = require("./middleware/auth"); // ★ これ追加！
const categories_1 = __importDefault(require("./routes/categories"));
const JWT_SECRET = "mysecretkey";
const app = (0, express_1.default)();
const port = 3001;
// テストルート
app.get("/test-debug", (req, res) => {
    console.log("🔥 /test-debug にアクセスされた！");
    res.send("テストルートOK！");
});
// ミドルウェア
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use("/tasks", tasks_1.default);
app.use("/api/users", user_1.default); // ✅ /api/users に userRoutes をマウント
app.use("/api/categories", categories_1.default); // ← これここ！
// サーバー起動
app.listen(port, () => {
    console.log(`サーバー起動中 → http://localhost:${port}`);
});
// ログインAPI
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const checkSql = "SELECT * FROM users202504171 WHERE email = ?";
    db_1.db.query(checkSql, [email], (checkErr, results) => {
        if (checkErr) {
            console.error("ユーザー確認エラー:", checkErr);
            return res.status(500).json({ message: "サーバーエラーが発生しました" });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "ユーザーが見つかりません" });
        }
        const user = results[0];
        bcrypt_1.default.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("パスワード照合エラー:", err);
                return res
                    .status(500)
                    .json({ message: "サーバーエラーが発生しました" });
            }
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "ユーザー名またはパスワードが間違っています" });
            }
            const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
            res.json({ token });
        });
    });
});
// ユーザー登録API
app.post("/api/register", (req, res) => {
    const { email, password } = req.body;
    const checkSql = "SELECT * FROM users202504171 WHERE email = ?";
    db_1.db.query(checkSql, [email], (checkErr, results) => {
        if (checkErr) {
            console.error("ユーザー確認エラー:", checkErr);
            return res.status(500).json({ message: "サーバーエラーが発生しました" });
        }
        if (results.length > 0) {
            return res
                .status(409)
                .json({ message: "このメールアドレスは既に使用されています" });
        }
        bcrypt_1.default.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error("ハッシュ化エラー:", hashErr);
                return res
                    .status(500)
                    .json({ message: "登録に失敗しました（ハッシュ化エラー）" });
            }
            const insertSql = "INSERT INTO users202504171 (email, password) VALUES (?, ?)";
            db_1.db.query(insertSql, [email, hashedPassword], (insertErr, result) => {
                if (insertErr) {
                    console.error("DB登録エラー:", insertErr);
                    const errorCode = insertErr.code;
                    console.log("errorCode:", errorCode);
                    if (errorCode === "ER_DUP_ENTRY") {
                        console.log("💡 ER_DUP_ENTRY に入りました！");
                        return res.status(409).json({
                            message: "このメールアドレスは既に使用されています（DB）",
                        });
                    }
                    return res.status(500).json({ message: "登録に失敗しました" });
                }
                res.status(200).json({ message: "登録成功！" });
            });
        });
    });
});
// 保護されたデータ取得API（おまけ）
app.get("/api/protected", auth_1.authenticateToken, (req, res) => {
    // ★ ここ修正！
    res.json({ message: "これは保護されたデータです", user: req.user });
});
