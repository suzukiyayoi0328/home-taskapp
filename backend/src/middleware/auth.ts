import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "mysecretkey";

// 🔸 JWTの中身の型
export interface JwtPayload {
  email: string;
  id: number;
}

// 🔸 req.user を型安全に使うために拡張
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "トークンが必要です" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ トークン無効");
      res.status(403).json({ message: "トークンが無効です" });
      return;
    }

    // 🔸 デコード成功 → req.user に代入
    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as JwtPayload;
      console.log("✅ 認証ユーザーID:", req.user.id); // ← デバッグ用
      next();
    } else {
      console.log("❌ トークンデコード形式エラー");
      res.status(403).json({ message: "トークンの形式が無効です" });
    }
  });
};

export default authenticateToken;
