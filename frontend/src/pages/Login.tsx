import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4.5C7 4.5 2.7 9 1 12c1.7 3 6 7.5 11 7.5s9.3-4.5 11-7.5c-1.7-3-6-7.5-11-7.5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"
        fill="#888"
      />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 6.3a5 5 0 0 1 6.9 6.9m-1.5 1.5a5 5 0 0 1-6.9-6.9"
        stroke="#888"
        strokeWidth="2"
      />
      <path
        d="M12 5C7 5 2.7 9 1 12c1.7 3 6 7 11 7 1.8 0 3.4-.4 5-1.2"
        stroke="#888"
        strokeWidth="2"
      />
    </svg>
  );

  useEffect(() => {
    const successFlag = localStorage.getItem("registerSuccess");
    if (successFlag === "true") {
      setShowToast(true);
      setIsFadingOut(false);

      setTimeout(() => setIsFadingOut(true), 3000);
      setTimeout(() => {
        setShowToast(false);
        setIsFadingOut(false);
        localStorage.removeItem("registerSuccess");
      }, 4000);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("loginSuccess", "true");
      navigate("/mypage");
    } catch {
      setLoginError("メールアドレスまたはパスワードが違います");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">ログイン</h2>

        <div className="form-group">
          <label htmlFor="username">メールアドレス</label>
          <div className="input-icon">
            <span className="icon">✉</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <div className="input-icon">
            <span className="icon">🔒</span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        {loginError && <div className="error-message">{loginError}</div>}
        <button className="submit-button" onClick={handleLogin}>
          ログイン
        </button>

        <p className="form-footer">
          アカウントをお持ちでない方は{" "}
          <span className="signup-link" onClick={() => navigate("/register")}>
            無料新規登録
          </span>
          ですぐにご利用いただけます。
        </p>
      </div>
      {showToast && (
        <div className={`toast ${isFadingOut ? "hide" : ""}`}>
          ユーザー登録が完了しました！ログインしてください
        </div>
      )}
    </div>
  );
}

export default Login;
