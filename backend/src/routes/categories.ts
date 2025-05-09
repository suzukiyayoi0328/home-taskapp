import express from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import authenticateToken from "../middleware/auth";

const router = express.Router();

// カテゴリ追加（users202504171_id追加）
router.post("/", authenticateToken, (req: any, res: any) => {
  const { name, category_color } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "カテゴリ名は必須です" });
  }

  const sql = `
    INSERT INTO categories (name, color, users202504171_id)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [name, category_color || "#000000", userId], (err, result) => {
    if (err) {
      console.error("カテゴリ追加失敗:", err);
      return res.status(500).json({ message: "カテゴリの追加に失敗しました" });
    }

    const insertResult = result as ResultSetHeader;
    res.status(201).json({
      message: "カテゴリ追加成功！",
      categoryId: insertResult.insertId,
    });
  });
});

// カテゴリ一覧（共通カテゴリも含む）
router.get("/", authenticateToken, (req: any, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, name, color AS category_color
    FROM categories
    WHERE users202504171_id = ? OR users202504171_id IS NULL
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("カテゴリ取得失敗:", err);
      return res.status(500).json({ message: "カテゴリの取得に失敗しました" });
    }

    const rows = results as RowDataPacket[];
    res.json(rows);
  });
});

// カテゴリ更新（users202504171_idも確認）
router.put("/:id", authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const { name, category_color } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "カテゴリ名は必須です" });
  }

  const sql = `
    UPDATE categories
    SET name = ?, color = ?
    WHERE id = ? AND users202504171_id = ?
  `;
  db.query(
    sql,
    [name, category_color || "#000000", id, userId],
    (err, result) => {
      if (err) {
        console.error("カテゴリ更新失敗:", err);
        return res
          .status(500)
          .json({ message: "カテゴリの更新に失敗しました" });
      }

      res.json({ message: "カテゴリ更新成功！" });
    }
  );
});

// カテゴリ削除（users202504171_idも確認）
router.delete("/:id", authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = `
    DELETE FROM categories
    WHERE id = ? AND users202504171_id = ?
  `;
  db.query(sql, [id, userId], (err, result) => {
    if (err) {
      console.error("カテゴリ削除失敗:", err);
      return res.status(500).json({ message: "カテゴリの削除に失敗しました" });
    }

    res.json({ message: "カテゴリ削除成功！" });
  });
});

export default router;
