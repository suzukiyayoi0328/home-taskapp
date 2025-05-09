"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./middleware/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const upload_1 = __importDefault(require("./routes/upload"));
const JWT_SECRET = "mysecretkey";
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// ミドルウェア
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use("/tasks", tasks_1.default);
app.use("/api/users", user_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/upload", upload_1.default);
// サーバー起動
app.listen(port, () => {
    console.log(`✅ サーバー起動中 (port: ${port})`);
});
// ログインAPI
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const checkSql = "SELECT * FROM users202504171 WHERE email = $1";
        const result = yield db_1.db.query(checkSql, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "ユーザーが見つかりません" });
        }
        const user = result.rows[0];
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "ユーザー名またはパスワードが間違っています" });
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user.id }, JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token });
    }
    catch (error) {
        console.error("ログインエラー:", error);
        res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
}));
// ユーザー登録API
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const checkSql = "SELECT * FROM users202504171 WHERE email = $1";
        const checkResult = yield db_1.db.query(checkSql, [email]);
        if (checkResult.rows.length > 0) {
            return res
                .status(409)
                .json({ message: "このメールアドレスは既に使用されています" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const insertSql = "INSERT INTO users202504171 (email, password) VALUES ($1, $2)";
        yield db_1.db.query(insertSql, [email, hashedPassword]);
        res.status(200).json({ message: "登録成功！" });
    }
    catch (error) {
        console.error("DB登録エラー:", error);
        if (error.code === "23505") {
            // PostgreSQLの一意制約違反コード
            return res
                .status(409)
                .json({ message: "このメールアドレスは既に使用されています（DB）" });
        }
        res.status(500).json({ message: "登録に失敗しました" });
    }
}));
// 保護されたデータ取得API
app.get("/api/protected", auth_1.default, (req, res) => {
    res.json({ message: "これは保護されたデータです", user: req.user });
});
