import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "home_task_app",
});

db.connect((err) => {
  if (err) {
    console.error("DB接続失敗:", err);
  } else {
    console.log("DB接続成功");
  }
});
