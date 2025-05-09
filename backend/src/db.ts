// db.ts
import { Client } from "pg"; // PostgreSQL用のクライアントをインポート

// PostgreSQLの接続設定
export const db = new Client({
  host: "home-task-app-db-name-render.onrender.com",
  user: "home_task_app_user",
  password: "oZApnXA0Z8MBVW6tpMkVTDoRe4GlYQrD",
  database: "home_task_app",
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error("DB接続失敗:", err);
  } else {
    console.log("DB接続成功");
  }
});
