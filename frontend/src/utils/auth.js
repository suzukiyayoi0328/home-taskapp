export const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return !!token; // トークンがあれば true（ログイン状態）
};
