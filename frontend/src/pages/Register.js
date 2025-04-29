import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";
function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [formError, setFormError] = useState("");
    const EyeIcon = () => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M12 4.5C7 4.5 2.7 9 1 12c1.7 3 6 7.5 11 7.5s9.3-4.5 11-7.5c-1.7-3-6-7.5-11-7.5zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z", fill: "#888" }) }));
    const EyeOffIcon = () => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M3 3l18 18M10.6 6.3a5 5 0 0 1 6.9 6.9m-1.5 1.5a5 5 0 0 1-6.9-6.9", stroke: "#888", strokeWidth: "2" }), _jsx("path", { d: "M12 5C7 5 2.7 9 1 12c1.7 3 6 7 11 7 1.8 0 3.4-.4 5-1.2", stroke: "#888", strokeWidth: "2" })] }));
    const handleRegister = async () => {
        setEmailError("");
        setPasswordError("");
        if (!email || !password || !confirmPassword) {
            setFormError("すべての項目を入力してください！");
            return;
        }
        const isPasswordStrong = (pw) => {
            const lengthCheck = /^.{6,20}$/;
            const upperCheck = /[A-Z]/;
            const lowerCheck = /[a-z]/;
            const numberCheck = /[0-9]/;
            return (lengthCheck.test(pw) &&
                upperCheck.test(pw) &&
                lowerCheck.test(pw) &&
                numberCheck.test(pw));
        };
        if (!isPasswordStrong(password)) {
            setPasswordError("パスワードは6〜20文字で、大文字・小文字・数字をすべて含めてください。");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("パスワードが一致しません！");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("正しいメールアドレスを入力してください！");
            return;
        }
        try {
            const response = await axios.post("http://localhost:3001/api/register", {
                email,
                password,
            });
            console.log("登録成功！", response.data);
            alert("ユーザー登録が完了しました！");
            navigate("/");
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("\uD83D\uDD25 Axios error response:", error.response);
                if (error.response?.status === 409) {
                    setEmailError("このメールアドレスはすでに使用されています。");
                }
                else {
                    console.error("登録エラー:", error);
                    alert("登録に失敗しました。");
                }
            }
            else {
                console.error("予期しないエラー:", error);
                alert("予期しないエラーが発生しました。");
            }
        }
    };
    return (_jsx("div", { className: "login-page", children: _jsxs("div", { className: "login-card", children: [_jsx("h2", { className: "login-title", children: "\u65B0\u898F\u767B\u9332" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsxs("div", { className: "input-icon", children: [_jsx("span", { className: "icon", children: "\u2709" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value) })] }), emailError && _jsx("div", { className: "error-message", children: emailError })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsxs("div", { className: "input-icon", children: [_jsx("span", { className: "icon", children: "\uD83D\uDD12" }), _jsx("input", { id: "password", type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { type: "button", className: "password-toggle-btn", onClick: () => setShowPassword(!showPassword), children: showPassword ? _jsx(EyeOffIcon, {}) : _jsx(EyeIcon, {}) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "confirmPassword", children: "\u30D1\u30B9\u30EF\u30FC\u30C9\uFF08\u78BA\u8A8D\uFF09" }), _jsxs("div", { className: "input-icon", children: [_jsx("span", { className: "icon", children: "\uD83D\uDD12" }), _jsx("input", { id: "confirmPassword", type: showConfirmPassword ? "text" : "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) }), _jsx("button", { type: "button", className: "password-toggle-btn", onClick: () => setShowConfirmPassword(!showConfirmPassword), children: showConfirmPassword ? _jsx(EyeOffIcon, {}) : _jsx(EyeIcon, {}) })] }), passwordError && (_jsx("div", { className: "error-message", children: passwordError }))] }), formError && _jsx("div", { className: "error-message", children: formError }), _jsx("button", { className: "submit-button", onClick: handleRegister, children: "\u767B\u9332" }), _jsxs("p", { className: "form-footer", children: ["\u3059\u3067\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u3059\u304B\uFF1F", " ", _jsx("span", { className: "signup-link", onClick: () => navigate("/"), children: "\u30ED\u30B0\u30A4\u30F3" }), "\u306F\u3053\u3061\u3089"] })] }) }));
}
export default Register;
