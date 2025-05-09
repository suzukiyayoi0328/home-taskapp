"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// db.ts
const pg_1 = require("pg"); // PostgreSQL用のクライアントをインポート
// PostgreSQLの接続設定
exports.db = new pg_1.Client({
    host: "home-task-app-db-name-render.onrender.com",
    user: "home_task_app_user",
    password: "oZApnXA0Z8MBVW6tpMkVTDoRe4GlYQrD",
    database: "home_task_app",
    port: 5432,
});
exports.db.connect((err) => {
    if (err) {
        console.error("DB接続失敗:", err);
    }
    else {
        console.log("DB接続成功");
    }
});
