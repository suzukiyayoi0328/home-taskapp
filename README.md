# 家事タスク管理アプリ

##  アプリの概要
日々の家事や予定を、カテゴリごとに登録・管理できるWebアプリです。  
カレンダー表示・カレンダーからのタスク登録・ファイル添付にも対応しています。

## 使用技術
- フロントエンド：React (TypeScript)
- バックエンド：Node.js (Express)
- DB：MySQL
- デプロイ：Vercel（フロント） / Render（バックエンド）
- その他：react-big-calendar, axios, JWT認証, etc.

## 主な機能
- ユーザー登録 / ログイン（JWTによる認証）
- タスクの追加・編集・削除
- タスクのカテゴリ管理（色分け対応）
- カレンダーでのスケジュール可視化
- ファイル添付（画像プレビュー対応）
- ダークモード / レスポンシブ対応

##  画面イメージ

##  起動方法（開発用）
### フロントエンド
```bash
cd frontend
npm install
npm run dev

###バックエンド

cd backend
npm install
npm start
