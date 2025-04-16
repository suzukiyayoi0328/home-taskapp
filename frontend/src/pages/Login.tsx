import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました");
      }

      const data = await response.json();
      console.log("ログイン成功！トークン:", data.token);
      localStorage.setItem("token", data.token);
      alert("ログイン成功！");
      navigate("/mypage");
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。ユーザー名またはパスワードが違うかも！");
    }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">ログイン</h2>

        <div className="form-group">
          <label htmlFor="username">メールアドレス</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button onClick={handleLogin}>ログイン</button>
      </div>
    </div>
  );
}

export default Login;
