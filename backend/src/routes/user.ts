import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import authenticateToken, { JwtPayload } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = "mysecretkey";

// Expressの型拡張
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ✅ ユーザー登録
router.post("/register", async (req: any, res: any) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "すべての項目を入力してください" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users202504171 (email, password, username) VALUES (?, ?, ?)`;
  db.query(sql, [email, hashedPassword, username], (err, result) => {
    if (err) {
      console.error("登録失敗:", err);
      return res.status(500).json({ message: "ユーザー登録に失敗しました" });
    }

    const insertResult = result as ResultSetHeader;
    const newUserId = insertResult.insertId;

    // ✅ 初期カテゴリをコピー（users202504171_idがNULLのカテゴリを対象に）
    const copySql = `
  INSERT INTO categories (name, color, users202504171_id)
  SELECT name, color, ? FROM category_templates
`;
    db.query(copySql, [newUserId], (err2) => {
      if (err2) {
        console.error("初期カテゴリコピー失敗:", err2);
      } else {
        console.log("✅ 初期カテゴリコピー完了！");
      }
    });

    res.status(201).json({ message: "ユーザー登録成功！", userId: newUserId });
  });
});

// ✅ ログイン中ユーザーの email と username を返す
router.get("/me", authenticateToken, (req: any, res: any) => {
  const user = req.user;

  if (!user?.email) {
    return res
      .status(400)
      .json({ message: "メールアドレスが取得できませんでした" });
  }

  console.log("🔑 トークン内 email:", user.email);

  const sql = "SELECT email, username FROM users202504171 WHERE email = ?";
  db.query(sql, [user.email], (err, results) => {
    if (err) {
      console.error("ユーザー情報取得失敗:", err);
      return res
        .status(500)
        .json({ message: "ユーザー情報の取得に失敗しました" });
    }

    const rows = results as RowDataPacket[];

    if (rows.length === 0) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    const userData = rows[0];
    res.json({ email: userData.email, username: userData.username });
  });
});

// ✅ ユーザー名変更
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
