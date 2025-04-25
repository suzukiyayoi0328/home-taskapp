export interface JwtPayload {
  email: string;
  userId: number; // ← userId もトークンに入ってるので追加！
}
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "mysecretkey"; // ✅ 共通化！

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("🔥 authenticateToken 発動 in middleware/auth.ts"); // ログ確認！
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("🎫 トークン:", token);

  if (!token) {
    console.log("🚫 トークン無し");
    res.status(401).json({ message: "トークンが必要です" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ トークン無効");
      res.status(403).json({ message: "トークンが無効です" });
      return;
    }

    if (typeof decoded === "object" && decoded !== null) {
      console.log("✅ トークン認証成功:", decoded);
      req.user = decoded as JwtPayload; // ✅ 型を断言！
      next();
    } else {
      console.log("❌ トークンデコード形式エラー");
      res.status(403).json({ message: "トークンの形式が無効です" });
    }
  });
};
