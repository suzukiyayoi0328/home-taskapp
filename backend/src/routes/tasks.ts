import express from "express";
import { db } from "../db";
import authenticateToken from "../middleware/auth";

const router = express.Router();

// ✅ タスク一覧取得
router.get("/", authenticateToken, async (req: any, res: any) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      t.id,
      t.start_time,
      t.deadline,
      c.name AS category,
      c.color AS category_color,
      t.is_done,
      t.memo,
      t.attachment_url,
      t.repeat_type
    FROM tasks20250418 t
    LEFT JOIN categories c ON t.category = c.id
    WHERE t.users202504171_id = $1
  `;

  try {
    const result = await db.query(sql, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("タスク取得失敗:", err);
    res.status(500).json({ message: "タスクの取得に失敗しました" });
  }
});

// ✅ タスク1件取得
router.get("/:id", authenticateToken, async (req: any, res: any) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  const sql = `
    SELECT * FROM tasks20250418
    WHERE id = $1 AND users202504171_id = $2
  `;

  try {
    const result = await db.query(sql, [taskId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "タスクが見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("タスク取得失敗:", err);
    res.status(500).json({ message: "タスクの取得に失敗しました" });
  }
});

// ✅ タスク追加
router.post("/", authenticateToken, async (req: any, res: any) => {
  const { start_time, deadline, category, memo, attachment_url, repeat_type } =
    req.body;
  const userId = req.user.id;

  const sql = `
    INSERT INTO tasks20250418 (start_time, deadline, category, memo, attachment_url, repeat_type, users202504171_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  try {
    const result = await db.query(sql, [
      start_time,
      deadline,
      category,
      memo,
      attachment_url,
      repeat_type,
      userId,
    ]);
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("タスク追加失敗:", err);
    res.status(500).json({ message: "タスクの追加に失敗しました" });
  }
});

// ✅ 繰り返しグループ削除
router.post(
  "/repeat-group/delete",
  authenticateToken,
  async (req: any, res: any) => {
    const { category, memo, repeat_type } = req.body;
    const userId = req.user.id;

    const sql = `
    DELETE FROM tasks20250418
    WHERE category = $1 AND users202504171_id = $2 AND repeat_type = $3
    AND (memo = $4 OR (memo IS NULL AND $4 IS NULL))
  `;

    try {
      await db.query(sql, [category, userId, repeat_type, memo]);
      res.json({ message: "繰り返し削除成功" });
    } catch (err) {
      console.error("繰り返し削除失敗:", err);
      res.status(500).json({ message: "繰り返し削除に失敗しました" });
    }
  }
);

// ✅ ステータス変更
router.patch("/:id", authenticateToken, async (req: any, res: any) => {
  const taskId = req.params.id;
  const { is_done } = req.body;
  const userId = req.user.id;

  const sql = `
    UPDATE tasks20250418
    SET is_done = $1
    WHERE id = $2 AND users202504171_id = $3
  `;

  try {
    await db.query(sql, [is_done, taskId, userId]);
    res.json({ message: "ステータス更新成功" });
  } catch (err) {
    console.error("ステータス更新失敗:", err);
    res.status(500).json({ message: "更新に失敗しました" });
  }
});

// ✅ タスク更新
router.put("/:id", authenticateToken, async (req: any, res: any) => {
  const taskId = req.params.id;
  const { start_time, deadline, category, memo, attachment_url, repeat_type } =
    req.body;
  const userId = req.user.id;

  const sql = `
    UPDATE tasks20250418
    SET start_time = $1, deadline = $2, category = $3, memo = $4, attachment_url = $5, repeat_type = $6
    WHERE id = $7 AND users202504171_id = $8
  `;

  try {
    await db.query(sql, [
      start_time,
      deadline,
      category,
      memo,
      attachment_url,
      repeat_type,
      taskId,
      userId,
    ]);
    res.json({ message: "タスク更新成功" });
  } catch (err) {
    console.error("タスク更新失敗:", err);
    res.status(500).json({ message: "タスクの更新に失敗しました" });
  }
});

// ✅ 完了済みタスク全削除
router.delete("/completed", authenticateToken, async (req: any, res: any) => {
  const userId = req.user.id;

  const sql = `
    DELETE FROM tasks20250418
    WHERE is_done = 1 AND users202504171_id = $1
  `;

  try {
    await db.query(sql, [userId]);
    res.json({ message: "完了タスク削除成功" });
  } catch (err) {
    console.error("完了タスク削除失敗:", err);
    res.status(500).json({ message: "完了タスクの削除に失敗しました" });
  }
});

export default router;
