import { useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [formError, setFormError] = useState("");

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

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email || !password || !confirmPassword) {
      setFormError("すべての項目を入力してください！");
      return;
    }

    const isPasswordStrong = (pw: string) => {
      const lengthCheck = /^.{6,20}$/;
      const upperCheck = /[A-Z]/;
      const lowerCheck = /[a-z]/;
      const numberCheck = /[0-9]/;
      return (
        lengthCheck.test(pw) &&
        upperCheck.test(pw) &&
        lowerCheck.test(pw) &&
        numberCheck.test(pw)
      );
    };

    if (!isPasswordStrong(password)) {
      setPasswordError(
        "パスワードは6〜20文字で、大文字・小文字・数字をすべて含めてください。"
      );
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("パスワードが一致しません");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("正しいメールアドレスを入力してください！");
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.post(`${apiBaseUrl}/api/register`, {
        email,
        password,
      });

      console.log("登録成功！", response.data);

      const loginRes = await axios.post(`${apiBaseUrl}/api/login`, {
        email,
        password,
      });

      const token = loginRes.data.token;
      localStorage.setItem("token", token);

      localStorage.setItem("registerSuccess", "true");
      navigate("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("\uD83D\uDD25 Axios error response:", error.response);

        if (error.response?.status === 409) {
          setEmailError("このメールアドレスはすでに使用されています。");
        } else {
          console.error("登録エラー:", error);
          alert("登録に失敗しました。");
        }
      } else {
        console.error("予期しないエラー:", error);
        alert("予期しないエラーが発生しました。");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">新規登録</h2>

        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <div className="input-icon">
            <span className="icon">✉</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {emailError && <div className="error-message">{emailError}</div>}
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

        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード（確認）</label>
          <div className="input-icon">
            <span className="icon">🔒</span>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}
        </div>
        {formError && <div className="error-message">{formError}</div>}
        <button className="submit-button" onClick={handleRegister}>
          登録
        </button>

        <p className="form-footer">
          すでにアカウントをお持ちですか？{" "}
          <span className="signup-link" onClick={() => navigate("/")}>
            ログイン
          </span>
          はこちら
        </p>
      </div>
    </div>
  );
}

export default Register;
