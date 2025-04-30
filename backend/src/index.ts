import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import taskRouter from "./routes/tasks";
import userRoutes from "./routes/user";
import { authenticateToken } from "./middleware/auth";
import categoryRoutes from "./routes/categories";

const JWT_SECRET = "mysecretkey";

const app = express();
const port = 3001;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use("/tasks", taskRouter);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// サーバー起動
app.listen(port, () => {
  console.log(`サーバー起動中 → http://localhost:${port}`);
});

// ログインAPI
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const checkSql = "SELECT * FROM users202504171 WHERE email = ?";
  db.query(checkSql, [email], (checkErr, results: any[]) => {
    if (checkErr) {
      console.error("ユーザー確認エラー:", checkErr);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "ユーザーが見つかりません" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("パスワード照合エラー:", err);
        return res
          .status(500)
          .json({ message: "サーバーエラーが発生しました" });
      }

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "ユーザー名またはパスワードが間違っています" });
      }

      const token = jwt.sign(
        { email: user.email, userId: user.id },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    });
  });
});

// ユーザー登録API
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  const checkSql = "SELECT * FROM users202504171 WHERE email = ?";
  db.query(checkSql, [email], (checkErr, results: any[]) => {
    if (checkErr) {
      console.error("ユーザー確認エラー:", checkErr);
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }

    if (results.length > 0) {
      return res
        .status(409)
        .json({ message: "このメールアドレスは既に使用されています" });
    }

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("ハッシュ化エラー:", hashErr);
        return res
          .status(500)
          .json({ message: "登録に失敗しました（ハッシュ化エラー）" });
      }

      const insertSql =
        "INSERT INTO users202504171 (email, password) VALUES (?, ?)";
      db.query(insertSql, [email, hashedPassword], (insertErr, result) => {
        if (insertErr) {
          console.error("DB登録エラー:", insertErr);

          const errorCode = (insertErr as any).code;
          console.log("errorCode:", errorCode);

          if (errorCode === "ER_DUP_ENTRY") {
            console.log("💡 ER_DUP_ENTRY に入りました！");
            return res.status(409).json({
              message: "このメールアドレスは既に使用されています（DB）",
            });
          }

          return res.status(500).json({ message: "登録に失敗しました" });
        }

        res.status(200).json({ message: "登録成功！" });
      });
    });
  });
});

// 保護されたデータ取得API
app.get("/api/protected", authenticateToken, (req: any, res) => {
  res.json({ message: "これは保護されたデータです", user: req.user });
});
