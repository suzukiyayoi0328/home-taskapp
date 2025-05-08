import express from "express";
import { db } from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import authenticateToken from "../middleware/auth";

const router = express.Router();

// ✅ タスク一覧取得
router.get("/", authenticateToken, (req: any, res: any) => {
  console.log("認証ユーザーID:", req.user.id);

  const userId = req.user.id;

  const sql = `
    SELECT 
      tasks20250418.id,
      tasks20250418.start_time,
      tasks20250418.deadline,
      tasks20250418.category AS category_id,
      categories.name AS category,
      categories.color AS category_color,
      tasks20250418.is_done,
      tasks20250418.memo,
      tasks20250418.attachment_url,
      tasks20250418.repeat_type
    FROM 
      tasks20250418
    LEFT JOIN 
      categories ON tasks20250418.category = categories.id 
    WHERE tasks20250418.users202504171_id = $1

  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("タスク取得失敗:", err);
      return res.status(500).json({ message: "タスクの取得に失敗しました" });
    }

    const rows = results as RowDataPacket[];
    res.json(rows);
  });
});

// ✅ タスク1件取得（GET /tasks/:id）
router.get("/:id", authenticateToken, (req: any, res: any) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  const sql = `
    SELECT * FROM tasks20250418
    WHERE id = $1 AND users202504171_id = $2

  `;

  db.query(sql, [taskId, userId], (err, results) => {
    if (err) {
      console.error("タスク取得失敗:", err);
      return res.status(500).json({ message: "タスクの取得に失敗しました" });
    }

    if ((results as RowDataPacket[]).length === 0) {
      return res.status(404).json({ message: "タスクが見つかりません" });
    }

    res.json((results as RowDataPacket[])[0]);
  });
});

// ✅ タスク追加
router.post("/", authenticateToken, (req: any, res: any) => {
  console.log("受け取ったデータ:", req.body);
  const { start_time, deadline, category, memo, attachment_url, repeat_type } =
    req.body;
  const userId = req.user.id;

  const sql = `
    INSERT INTO tasks20250418 
    (start_time, deadline, category, memo, attachment_url, repeat_type, users202504171_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)

  `;

  db.query(
    sql,
    [start_time, deadline, category, memo, attachment_url, repeat_type, userId],
    (err, result) => {
      if (err) {
        console.error("タスク追加失敗:", err);
        return res.status(500).json({ message: "タスクの追加に失敗しました" });
      }

      const insertResult = result as ResultSetHeader;
      res.status(201).json({ id: insertResult.insertId });
    }
  );
});

// ✅ 繰り返しグループ削除（POST /tasks/repeat-group/delete）
router.post("/repeat-group/delete", authenticateToken, (req: any, res: any) => {
  const { category, memo, repeat_type } = req.body;
  const userId = req.user.id;

  const sql = `
    DELETE FROM tasks20250418
    WHERE category = $1 AND users202504171_id = $2 AND repeat_type = $3
AND (memo = $4 OR memo IS NULL AND $5 IS NULL)

  `;

  db.query(sql, [category, userId, repeat_type, memo, memo], (err, result) => {
    if (err) {
      console.error("繰り返し削除失敗:", err);
      return res.status(500).json({ message: "繰り返し削除に失敗しました" });
    }

    res.json({ message: "繰り返し削除成功" });
  });
});
// 🔧 ステータス変更API（PATCH）
router.patch("/:id", authenticateToken, (req: any, res: any) => {
  const taskId = req.params.id;
  const { is_done } = req.body;
  const userId = req.user.id;

  const sql = `
    UPDATE tasks20250418
    SET is_done = $1 WHERE id = $2 AND users202504171_id = $3

  `;

  db.query(sql, [is_done, taskId, userId], (err) => {
    if (err) {
      console.error("ステータス更新失敗:", err);
      return res.status(500).json({ message: "更新に失敗しました" });
    }

    res.json({ message: "ステータス更新成功" });
  });
});

// ✅ タスク更新
router.put("/:id", authenticateToken, (req: any, res: any) => {
  const taskId = req.params.id;
  const { start_time, deadline, category, memo, attachment_url, repeat_type } =
    req.body;
  const userId = req.user.id;

  const sql = `
    UPDATE tasks20250418
    SET start_time = $1, deadline = $2, category = $3, memo = $4, attachment_url = $5, repeat_type = $6
WHERE id = $7 AND users202504171_id = $8

  `;

  db.query(
    sql,
    [
      start_time,
      deadline,
      category,
      memo,
      attachment_url,
      repeat_type,
      taskId,
      userId,
    ],
    (err) => {
      if (err) {
        console.error("タスク更新失敗:", err);
        return res.status(500).json({ message: "タスクの更新に失敗しました" });
      }

      res.json({ message: "タスク更新成功" });
    }
  );
});

// ✅ 完了済みタスク全削除（DELETE /tasks/completed）←順番ここが大事！
router.delete("/completed", authenticateToken, (req: any, res: any) => {
  const userId = req.user.id;

  const sql = `
    DELETE FROM tasks20250418
    WHERE is_done = 1 AND users202504171_id = $1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("完了タスク削除エラー:", err);
      return res
        .status(500)
        .json({ message: "完了タスクの削除に失敗しました" });
    }

    res.json({ message: "完了タスクをすべて削除しました！" });
  });
});

// ✅ タスク削除（ID指定）
router.delete("/:id", authenticateToken, (req: any, res: any) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  const sql = `
    DELETE FROM tasks20250418
    WHERE id = $1 AND users202504171_id = $2
  `;

  db.query(sql, [taskId, userId], (err) => {
    if (err) {
      console.error("タスク削除失敗:", err);
      return res.status(500).json({ message: "タスクの削除に失敗しました" });
    }

    res.json({ message: "タスク削除成功" });
  });
});

export default router;
