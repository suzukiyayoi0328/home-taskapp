"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
exports.db = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "home_task_app",
});
exports.db.connect((err) => {
    if (err) {
        console.error("❌ DB接続失敗:", err);
    }
    else {
        console.log("✅ DB接続成功");
    }
});
