import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import express from "express";

const router = express.Router();

// ✅ タスク一覧取得（GET /tasks）
router.get("/", (req: any, res: any) => {
  const sql = `
  SELECT 
    tasks20250418.id,
    tasks20250418.start_time,
    tasks20250418.deadline,
    categories.name AS category,
    categories.color AS category_color,
    tasks20250418.is_done,
    tasks20250418.memo  
  FROM 
    tasks20250418
  LEFT JOIN 
    categories ON tasks20250418.category = categories.id 
  ORDER BY 
    CASE WHEN deadline IS NULL THEN 1 ELSE 0 END,
    deadline ASC
`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("タスク一覧取得エラー:", err);
      return res.status(500).json({ message: "一覧取得に失敗しました" });
    }
    console.log("📦 タスク一覧取得結果:", results);
    res.status(200).json(results);
  });
});

// ✅ タスク追加（POST /tasks）
router.post("/", (req: any, res: any) => {
  const { start_time, deadline, category, memo = null } = req.body; // ここ修正！
  console.log("🚀 受信データ (POST):", {
    start_time,
    deadline,
    category,
    memo,
  });

  const insertSql = `
    INSERT INTO tasks20250418 (start_time, deadline, category, memo, is_done)
    VALUES (?, ?, ?, ?, 0)
  `;
  db.query(
    insertSql,
    [start_time || null, deadline || null, category || null, memo || null],
    (err, result) => {
      if (err) {
        console.error("タスク登録エラー:", err);
        return res.status(500).json({ message: "タスクの登録に失敗しました" });
      }

      const insertResult = result as ResultSetHeader;
      res.status(201).json({
        message: "タスク登録完了！",
        taskId: insertResult.insertId,
      });
    }
  );
});

// ✅ ステータス更新（PATCH /tasks/:id）
router.patch("/:id", (req: any, res: any) => {
  const taskId = req.params.id;
  const { is_done } = req.body;
  console.log("🔧 PATCHリクエスト受信:", { taskId, is_done }); // 追加！

  if (typeof is_done !== "number") {
    return res.status(400).json({ message: "is_doneは数値で指定してください" });
  }

  const updateSql = "UPDATE tasks20250418 SET is_done = ? WHERE id = ?";
  db.query(updateSql, [is_done, taskId], (err) => {
    if (err) {
      console.error("ステータス更新エラー:", err);
      return res
        .status(500)
        .json({ message: "ステータスの更新に失敗しました" });
    }

    res.status(200).json({ message: "ステータス更新成功！" });
  });
});

// ✅ タスク更新（PUT /tasks/:id）
router.put("/:id", (req: any, res: any) => {
  console.log("受け取ったデータ:", req.body);
  const taskId = req.params.id;
  const { start_time, deadline, category, memo = null } = req.body;

  console.log("受け取ったデータ:", req.body); // デバッグ

  const sql = `
    UPDATE tasks20250418
    SET start_time = ?, deadline = ?, category = ?, memo = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      start_time || null,
      deadline || null,
      category || null,
      memo || null,
      taskId,
    ],
    (err) => {
      if (err) {
        console.error("タスク編集エラー:", err);
        return res.status(500).json({ message: "タスクの更新に失敗しました" });
      }

      res.status(200).json({ message: "タスクを更新しました！" });
    }
  );
});
//タスク全削除
router.delete("/completed", (req, res) => {
  const sql = "DELETE FROM tasks20250418 WHERE is_done = 1";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("完了タスク削除エラー:", err);
      return res.status(500).json({ message: "削除に失敗しました" });
    }
    res.json({ message: "完了タスクを削除しました" });
  });
});
// ✅ タスク削除（DELETE /tasks/:id）
router.delete("/:id", (req, res) => {
  const taskId = req.params.id;
  const deleteSql = "DELETE FROM tasks20250418 WHERE id = ?";

  db.query(deleteSql, [taskId], (err) => {
    if (err) {
      console.error("削除エラー:", err);
      return res.status(500).json({ message: "削除に失敗しました" });
    }

    res.status(200).json({ message: "タスク削除成功！" });
  });
});

// ✅ タスク詳細取得（GET /tasks/:id）
router.get("/:id", (req: any, res: any) => {
  const taskId = req.params.id;
  const sql = "SELECT * FROM tasks20250418 WHERE id = ?";

  db.query(sql, [taskId], (err, results) => {
    if (err) {
      console.error("タスク取得エラー:", err);
      return res.status(500).json({ message: "タスク取得に失敗しました" });
    }

    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      return res.status(404).json({ message: "タスクが見つかりません" });
    }

    res.status(200).json(rows[0]);
  });
});

export default router;
