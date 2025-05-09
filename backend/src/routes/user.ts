import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import authenticateToken, { JwtPayload } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = "mysecretkey";

// ✅ req.user 型拡張
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ✅ ユーザー登録 + 初期カテゴリコピー
router.post("/register", async (req: any, res: any) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "すべての項目を入力してください" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertSql = `
      INSERT INTO users202504171 (email, password, username)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await db.query(insertSql, [email, hashedPassword, username]);
    const newUserId = result.rows[0].id;

    const copySql = `
      INSERT INTO categories (name, color, users202504171_id)
      SELECT name, color, $1 FROM category_templates
    `;
    await db.query(copySql, [newUserId]);

    console.log("✅ 初期カテゴリコピー完了！");
    res.status(201).json({ message: "ユーザー登録成功！", userId: newUserId });
  } catch (err) {
    console.error("登録失敗:", err);
    res.status(500).json({ message: "ユーザー登録に失敗しました" });
  }
});

// ✅ 自分の情報取得
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ユーザー情報取得失敗:", err);
    res.status(500).json({ message: "ユーザー情報の取得に失敗しました" });
  }
});

// ✅ ユーザー名更新
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
