import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password", // 自分の設定に合わせて
  database: "home_task_app", // 実際に作ったDB名に合わせてね
});
