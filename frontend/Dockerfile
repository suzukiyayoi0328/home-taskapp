# Node.jsの公式イメージを使う
FROM node:18

# 作業ディレクトリを作成
WORKDIR /app

# 依存ファイルをコピーしてインストール
COPY package.json package-lock.json* ./
RUN npm install

# 残りのファイルをコピー
COPY . .

# アプリを起動
CMD ["npm", "run", "dev"]

# ポートを開ける（Viteのデフォルト）
EXPOSE 5173
