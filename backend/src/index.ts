import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import taskRouter from "./routes/tasks";
import userRoutes from "./routes/user";
import authenticateToken from "./middleware/auth";
import categoryRoutes from "./routes/categories";
import uploadRouter from "./routes/upload";

const JWT_SECRET = "mysecretkey";
const app = express();
const port = 3001;

// CORS設定
const allowedOrigins = [
  "http://localhost:3000",
  "https://home-taskapp-131k.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ルーティング
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRouter);

// サーバー起動
app.listen(port, () => {
  console.log(`✅ サーバー起動中 (port: ${port})`);
});

// ログインAPI
app.post("/api/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const sql = "SELECT * FROM users202504171 WHERE email = $1";
    const result = await db.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "ユーザーが見つかりません" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "ユーザー名またはパスワードが間違っています" });
    }

    const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("ログインエラー:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

// 登録API
app.post("/api/register", async (req: any, res: any) => {
  const { email, password } = req.body;

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
      "INSERT INTO users202504171 (email, password) VALUES ($1, $2)";
    await db.query(insertSql, [email, hashedPassword]);

    res.status(200).json({ message: "登録成功！" });
  } catch (error: any) {
    console.error("登録エラー:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "このメールアドレスは既に使用されています（DB）" });
    }
    res.status(500).json({ message: "登録に失敗しました" });
  }
});

// 認証保護API
app.get("/api/protected", authenticateToken, (req: any, res: Response) => {
  res.json({ message: "これは保護されたデータです", user: req.user });
});
