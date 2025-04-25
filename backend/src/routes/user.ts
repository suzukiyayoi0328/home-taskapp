console.log("🚀 userルーターが読み込まれた！");

import express, { Request, Response } from "express";
import { authenticateToken, JwtPayload } from "../middleware/auth";
import { db } from "../db";
import { RowDataPacket } from "mysql2";

const router = express.Router();

// Expressの型拡張（req.user に JwtPayload 型を使う）
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// GET /me → ログイン中ユーザーの email と username を返す
router.get("/me", authenticateToken, (req: any, res: any) => {
  console.log("📡 /me エンドポイントにリクエストあり"); // ★ ここ追加

  const user = req.user; // 型は自動で JwtPayload

  if (!user?.email) {
    console.log("🚫 トークンには email が入っていない！"); // ★ ここ追加
    return res
      .status(400)
      .json({ message: "メールアドレスが取得できませんでした" });
  }

  console.log("🔑 トークン内 email:", user.email); // ★ ここ追加

  const sql = "SELECT email, username FROM users202504171 WHERE email = ?";
  db.query(sql, [user.email], (err, results) => {
    if (err) {
      console.error("ユーザー情報取得失敗:", err);
      return res
        .status(500)
        .json({ message: "ユーザー情報の取得に失敗しました" });
    }

    const rows = results as RowDataPacket[];
    console.log("🔍 DBから取得したユーザー情報:", rows); // ★ ここ追加

    if (rows.length === 0) {
      console.log("⚠️ DBにユーザーが見つからない！");
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    const userData = rows[0];
    console.log("✅ レスポンス返却:", userData); // ★ ここ追加
    res.json({ email: userData.email, username: userData.username });
  });
});
// PUT /update-username → ユーザー名変更
router.put("/update-username", authenticateToken, (req: any, res: any) => {
  const user = req.user;
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ message: "ユーザー名を入力してください" });
  }

  const sql = "UPDATE users202504171 SET username = ? WHERE email = ?";
  db.query(sql, [username, user.email], (err) => {
    if (err) {
      console.error("ユーザー名更新失敗:", err);
      return res.status(500).json({ message: "更新に失敗しました" });
    }

    res.json({ message: "ユーザー名を更新しました！" });
  });
});

export default router;
