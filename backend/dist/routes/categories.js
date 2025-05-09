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
const db_1 = require("../db");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// ✅ カテゴリ追加（users202504171_id追加）
router.post("/", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category_color } = req.body;
    const userId = req.user.id;
    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "カテゴリ名は必須です" });
    }
    try {
        const sql = `
      INSERT INTO categories (name, color, users202504171_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
        const result = yield db_1.db.query(sql, [
            name,
            category_color || "#000000",
            userId,
        ]);
        res.status(201).json({
            message: "カテゴリ追加成功！",
            categoryId: result.rows[0].id,
        });
    }
    catch (err) {
        console.error("カテゴリ追加失敗:", err);
        res.status(500).json({ message: "カテゴリの追加に失敗しました" });
    }
}));
// ✅ カテゴリ一覧（共通カテゴリも含む）
router.get("/", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const sql = `
      SELECT id, name, color AS category_color
      FROM categories
      WHERE users202504171_id = $1 OR users202504171_id IS NULL
    `;
        const result = yield db_1.db.query(sql, [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error("カテゴリ取得失敗:", err);
        res.status(500).json({ message: "カテゴリの取得に失敗しました" });
    }
}));
// ✅ カテゴリ更新（users202504171_idも確認）
router.put("/:id", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, category_color } = req.body;
    const userId = req.user.id;
    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "カテゴリ名は必須です" });
    }
    try {
        const sql = `
      UPDATE categories
      SET name = $1, color = $2
      WHERE id = $3 AND users202504171_id = $4
    `;
        yield db_1.db.query(sql, [name, category_color || "#000000", id, userId]);
        res.json({ message: "カテゴリ更新成功！" });
    }
    catch (err) {
        console.error("カテゴリ更新失敗:", err);
        res.status(500).json({ message: "カテゴリの更新に失敗しました" });
    }
}));
// ✅ カテゴリ削除（users202504171_idも確認）
router.delete("/:id", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const sql = `
      DELETE FROM categories
      WHERE id = $1 AND users202504171_id = $2
    `;
        yield db_1.db.query(sql, [id, userId]);
        res.json({ message: "カテゴリ削除成功！" });
    }
    catch (err) {
        console.error("カテゴリ削除失敗:", err);
        res.status(500).json({ message: "カテゴリの削除に失敗しました" });
    }
}));
exports.default = router;
