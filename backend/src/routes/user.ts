import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
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

  try {
    const checkSql = "SELECT * FROM users202504171 WHERE email = $1";
    const checkResult = await db.query(checkSql, [email]);

    if (checkResult.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "このメールアドレスは既に使用されています" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertSql =
      "INSERT INTO users202504171 (email, password, username) VALUES ($1, $2, $3) RETURNING id";
    const insertResult = await db.query(insertSql, [
      email,
      hashedPassword,
      username,
    ]);
    const newUserId = insertResult.rows[0].id;

    // ✅ 初期カテゴリをコピー（users202504171_idがNULLのカテゴリを対象に）
    const copySql = `
      INSERT INTO categories (name, color, users202504171_id)
      SELECT name, color, $1 FROM category_templates
    `;
    await db.query(copySql, [newUserId]);

    res.status(201).json({ message: "ユーザー登録成功！", userId: newUserId });
  } catch (err) {
    console.error("登録失敗:", err);
    res.status(500).json({ message: "ユーザー登録に失敗しました" });
  }
});

// ✅ ログイン中ユーザーの email と username を返す
router.get("/me", authenticateToken, async (req: any, res: any) => {
  const user = req.user;

  if (!user?.email) {
    return res
      .status(400)
      .json({ message: "メールアドレスが取得できませんでした" });
  }

  try {
    const sql = "SELECT email, username FROM users202504171 WHERE email = $1";
    const result = await db.query(sql, [user.email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    const userData = result.rows[0];
    res.json({ email: userData.email, username: userData.username });
  } catch (err) {
    console.error("ユーザー情報取得失敗:", err);
    res.status(500).json({ message: "ユーザー情報の取得に失敗しました" });
  }
});

// ✅ ユーザー名変更
router.put(
  "/update-username",
  authenticateToken,
  async (req: any, res: any) => {
    const user = req.user;
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "ユーザー名を入力してください" });
    }

    try {
      const sql = "UPDATE users202504171 SET username = $1 WHERE email = $2";
      await db.query(sql, [username, user.email]);
      res.json({ message: "ユーザー名を更新しました！" });
    } catch (err) {
      console.error("ユーザー名更新失敗:", err);
      res.status(500).json({ message: "更新に失敗しました" });
    }
  }
);

export default router;
