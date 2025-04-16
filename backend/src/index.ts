import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./db";
import jwt from "jsonwebtoken";

// ミドルウェア関数
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer xxx" → "xxx"

  if (!token) {
    return res.status(401).json({ message: "トークンが必要です" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "トークンが無効です" });
    }
    req.user = user;
    next();
  });
};

const app = express();
const port = 3001;

// 秘密鍵（実際はもっと複雑な文字列が望ましい）
const JWT_SECRET = "mysecretkey";

app.use(cors());
app.use(bodyParser.json());

// 仮のユーザーデータ
const mockUser = {
  username: "testuser",
  password: "password123",
};

// ログインAPI
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === mockUser.username && password === mockUser.password) {
    // JWTトークンを発行
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } else {
    res
      .status(401)
      .json({ message: "ユーザー名またはパスワードが間違っています" });
  }
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error("DBエラー:", err);
      res.status(500).send("登録に失敗しました");
    } else {
      res.status(200).send("ユーザー登録成功！");
    }
  });
});

app.listen(port, () => {
  console.log(`サーバー起動中 → http://localhost:${port}`);
});

app.get("/api/protected", authenticateToken, (req: any, res) => {
  res.json({ message: "これは保護されたデータです", user: req.user });
});
