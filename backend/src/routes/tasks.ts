import express from "express";
import { db } from "../db";
import authenticateToken from "../middleware/auth";

const router = express.Router();

// ✅ カテゴリ追加（users202504171_id追加）
router.post("/", authenticateToken, async (req: any, res: any) => {
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
    const result = await db.query(sql, [
      name,
      category_color || "#000000",
      userId,
    ]);
    res.status(201).json({
      message: "カテゴリ追加成功！",
      categoryId: result.rows[0].id,
    });
  } catch (err) {
    console.error("カテゴリ追加失敗:", err);
    res.status(500).json({ message: "カテゴリの追加に失敗しました" });
  }
});

// ✅ カテゴリ一覧（共通カテゴリも含む）
router.get("/", authenticateToken, async (req: any, res) => {
  const userId = req.user.id;

  try {
    const sql = `
      SELECT id, name, color AS category_color
      FROM categories
      WHERE users202504171_id = $1 OR users202504171_id IS NULL
    `;
    const result = await db.query(sql, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("カテゴリ取得失敗:", err);
    res.status(500).json({ message: "カテゴリの取得に失敗しました" });
  }
});

// ✅ カテゴリ更新（users202504171_idも確認）
router.put("/:id", authenticateToken, async (req: any, res: any) => {
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
    await db.query(sql, [name, category_color || "#000000", id, userId]);
    res.json({ message: "カテゴリ更新成功！" });
  } catch (err) {
    console.error("カテゴリ更新失敗:", err);
    res.status(500).json({ message: "カテゴリの更新に失敗しました" });
  }
});

// ✅ カテゴリ削除（users202504171_idも確認）
router.delete("/:id", authenticateToken, async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const sql = `
      DELETE FROM categories
      WHERE id = $1 AND users202504171_id = $2
    `;
    await db.query(sql, [id, userId]);
    res.json({ message: "カテゴリ削除成功！" });
  } catch (err) {
    console.error("カテゴリ削除失敗:", err);
    res.status(500).json({ message: "カテゴリの削除に失敗しました" });
  }
});

export default router;
