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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
const JWT_SECRET = "mysecretkey";
// ✅ ユーザー登録 + 初期カテゴリコピー
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: "すべての項目を入力してください" });
    }
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const insertSql = `
      INSERT INTO users202504171 (email, password, username)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
        const result = yield db_1.db.query(insertSql, [email, hashedPassword, username]);
        const newUserId = result.rows[0].id;
        const copySql = `
      INSERT INTO categories (name, color, users202504171_id)
      SELECT name, color, $1 FROM category_templates
    `;
        yield db_1.db.query(copySql, [newUserId]);
        console.log("✅ 初期カテゴリコピー完了！");
        res.status(201).json({ message: "ユーザー登録成功！", userId: newUserId });
    }
    catch (err) {
        console.error("登録失敗:", err);
        res.status(500).json({ message: "ユーザー登録に失敗しました" });
    }
}));
// ✅ 自分の情報取得
router.get("/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        return res
            .status(400)
            .json({ message: "メールアドレスが取得できませんでした" });
    }
    try {
        const sql = "SELECT email, username FROM users202504171 WHERE email = $1";
        const result = yield db_1.db.query(sql, [user.email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "ユーザーが見つかりません" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error("ユーザー情報取得失敗:", err);
        res.status(500).json({ message: "ユーザー情報の取得に失敗しました" });
    }
}));
// ✅ ユーザー名更新
router.put("/update-username", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { username } = req.body;
    if (!username || username.trim() === "") {
        return res.status(400).json({ message: "ユーザー名を入力してください" });
    }
    try {
        const sql = "UPDATE users202504171 SET username = $1 WHERE email = $2";
        yield db_1.db.query(sql, [username, user.email]);
        res.json({ message: "ユーザー名を更新しました！" });
    }
    catch (err) {
        console.error("ユーザー名更新失敗:", err);
        res.status(500).json({ message: "更新に失敗しました" });
    }
}));
exports.default = router;
