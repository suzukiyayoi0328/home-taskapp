// routes/categories.ts
import express from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = express.Router();

router.post("/", (req: any, res: any) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "カテゴリ名は必須です" });
  }

  const sql = "INSERT INTO categories (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error("カテゴリ追加失敗:", err);
      return res.status(500).json({ message: "カテゴリの追加に失敗しました" });
    }

    const insertResult = result as ResultSetHeader; // ✅ 型を断言！
    res.status(201).json({
      message: "カテゴリ追加成功！",
      categoryId: insertResult.insertId,
    }); // ✅ ここ修正！
  });
});

// GET /api/categories → カテゴリ一覧取得
router.get("/", (req, res) => {
  const sql = "SELECT id, name, color AS category_color FROM categories";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("カテゴリ取得失敗:", err);
      return res.status(500).json({ message: "カテゴリの取得に失敗しました" });
    }

    const rows = results as RowDataPacket[];
    res.json(rows);
  });
});

// DELETE /api/categories/:id → カテゴリ削除
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("カテゴリ削除失敗:", err);
      return res.status(500).json({ message: "カテゴリの削除に失敗しました" });
    }
    res.json({ message: "カテゴリ削除成功！" });
  });
});

export default router;
