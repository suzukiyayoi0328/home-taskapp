// db.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Render推奨設定
  },
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB接続失敗:", err);
  } else {
    console.log("✅ DB接続成功");
  }
});
