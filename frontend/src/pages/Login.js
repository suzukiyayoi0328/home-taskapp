import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const EyeIcon = () =>
    _jsx("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      children: _jsx("path", {
        d: "M12 4.5C7 4.5 2.7 9 1 12c1.7 3 6 7.5 11 7.5s9.3-4.5 11-7.5c-1.7-3-6-7.5-11-7.5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z",
        fill: "#888",
      }),
    });
  const EyeOffIcon = () =>
    _jsxs("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      children: [
        _jsx("path", {
          d: "M3 3l18 18M10.6 6.3a5 5 0 0 1 6.9 6.9m-1.5 1.5a5 5 0 0 1-6.9-6.9",
          stroke: "#888",
          strokeWidth: "2",
        }),
        _jsx("path", {
          d: "M12 5C7 5 2.7 9 1 12c1.7 3 6 7 11 7 1.8 0 3.4-.4 5-1.2",
          stroke: "#888",
          strokeWidth: "2",
        }),
      ],
    });
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
        throw new Error("ログインに失敗しました");
      }
      const data = await response.json();
      console.log("ログイン成功！トークン:", data.token);
      localStorage.setItem("token", data.token);
      navigate("/mypage");
      setLoginError("");
    } catch (error) {
      console.error("ログインエラー:", error);
      setLoginError("ユーザー名またはパスワードが違います");
    }
  };
  return _jsx("div", {
    className: "login-page",
    children: _jsxs("div", {
      className: "login-card",
      children: [
        _jsx("h2", {
          className: "login-title",
          children: "\u30ED\u30B0\u30A4\u30F3",
        }),
        _jsxs("div", {
          className: "form-group",
          children: [
            _jsx("label", {
              htmlFor: "username",
              children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
            }),
            _jsxs("div", {
              className: "input-icon",
              children: [
                _jsx("span", { className: "icon", children: "\u2709" }),
                _jsx("input", {
                  id: "username",
                  type: "text",
                  value: username,
                  onChange: (e) => setUsername(e.target.value),
                }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          className: "form-group",
          children: [
            _jsx("label", {
              htmlFor: "password",
              children: "\u30D1\u30B9\u30EF\u30FC\u30C9",
            }),
            _jsxs("div", {
              className: "input-icon",
              children: [
                _jsx("span", { className: "icon", children: "\uD83D\uDD12" }),
                _jsx("input", {
                  id: "password",
                  type: showPassword ? "text" : "password",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                }),
                _jsx("button", {
                  type: "button",
                  className: "password-toggle-btn",
                  onClick: () => setShowPassword(!showPassword),
                  children: showPassword
                    ? _jsx(EyeOffIcon, {})
                    : _jsx(EyeIcon, {}),
                }),
              ],
            }),
          ],
        }),
        loginError &&
          _jsx("div", { className: "error-message", children: loginError }),
        _jsx("button", {
          className: "submit-button",
          onClick: handleLogin,
          children: "\u30ED\u30B0\u30A4\u30F3",
        }),
        _jsxs("p", {
          className: "form-footer",
          children: [
            "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u306A\u3044\u65B9\u306F",
            " ",
            _jsx("span", {
              className: "signup-link",
              onClick: () => navigate("/register"),
              children: "\u7121\u6599\u65B0\u898F\u767B\u9332",
            }),
            "\u3067\u3059\u3050\u306B\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002",
          ],
        }),
      ],
    }),
  });
}
export default Login;
