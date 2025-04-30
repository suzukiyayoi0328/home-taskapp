"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
// ✅ カテゴリ追加
router.post("/", (req, res) => {
    const { name, category_color } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "カテゴリ名は必須です" });
    }
    const sql = "INSERT INTO categories (name, color) VALUES (?, ?)";
    db_1.db.query(sql, [name, category_color || "#000000"], (err, result) => {
        if (err) {
            console.error("カテゴリ追加失敗:", err);
            return res.status(500).json({ message: "カテゴリの追加に失敗しました" });
        }
        const insertResult = result;
        res.status(201).json({
            message: "カテゴリ追加成功！",
            categoryId: insertResult.insertId,
        });
    });
});
// ✅ カテゴリ一覧取得
router.get("/", (req, res) => {
    const sql = "SELECT id, name, color AS category_color FROM categories";
    db_1.db.query(sql, (err, results) => {
        if (err) {
            console.error("カテゴリ取得失敗:", err);
            return res.status(500).json({ message: "カテゴリの取得に失敗しました" });
        }
        const rows = results;
        res.json(rows);
    });
});
// ✅ カテゴリ更新
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, category_color } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ message: "カテゴリ名は必須です" });
    }
    const sql = "UPDATE categories SET name = ?, color = ? WHERE id = ?";
    db_1.db.query(sql, [name, category_color || "#000000", id], (err, result) => {
        if (err) {
            console.error("カテゴリ更新失敗:", err);
            return res.status(500).json({ message: "カテゴリの更新に失敗しました" });
        }
        res.json({ message: "カテゴリ更新成功！" });
    });
});
// ✅ カテゴリ削除
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM categories WHERE id = ?";
    db_1.db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("カテゴリ削除失敗:", err);
            return res.status(500).json({ message: "カテゴリの削除に失敗しました" });
        }
        res.json({ message: "カテゴリ削除成功！" });
    });
});
exports.default = router;
