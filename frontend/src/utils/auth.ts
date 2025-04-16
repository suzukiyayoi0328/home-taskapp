export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token; // トークンがあれば true（ログイン状態）
};
