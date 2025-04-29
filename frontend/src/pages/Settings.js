import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
function Settings() {
    const navigate = useNavigate();
    const [newUsername, setNewUsername] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    // 🌙 ダークモード用
    const [isDarkMode, setIsDarkMode] = useState(false);
    // ダークモードの状態をローカルストレージから読み込む
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
        }
    }, []);
    // ダークモード切替時にbodyクラスとローカルストレージを更新
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
        else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);
    // ユーザー情報取得
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3001/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                const displayName = data.username ?? data.email.split("@")[0];
                setNewUsername(displayName);
            }
            catch (err) {
                console.error("ユーザー情報取得失敗", err);
            }
        };
        fetchUser();
    }, []);
    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) {
            setMessage("ユーザー名を入力してください");
            setIsError(true);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3001/api/users/update-username", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username: newUsername }),
            });
            const data = await res.json();
            setMessage(data.message);
            setIsError(false);
        }
        catch (err) {
            console.error("ユーザー名更新失敗", err);
            setMessage("更新に失敗しました");
            setIsError(true);
        }
    };
    const handleLogout = () => {
        const confirmed = window.confirm("ログアウトしますか？");
        if (!confirmed)
            return;
        localStorage.removeItem("token");
        navigate("/");
    };
    return (_jsxs("div", { className: "settings-page", children: [_jsx("button", { className: "back-button", onClick: () => navigate("/mypage"), children: "\u2190 \u30DE\u30A4\u30DA\u30FC\u30B8\u306B\u623B\u308B" }), _jsxs("div", { className: "settings-card", children: [_jsx("h1", { className: "settings-title", children: "\u8A2D\u5B9A" }), _jsx("p", { className: "settings-description", children: "\u3053\u3053\u3067\u8A2D\u5B9A\u304C\u3067\u304D\u307E\u3059\u3002" }), _jsxs("div", { className: "form-group", children: [_jsxs("p", { className: "email-display", children: [newUsername, " \u3055\u3093"] }), _jsx("label", { children: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u540D" }), _jsxs("div", { className: "input-with-button", children: [_jsx("input", { type: "text", value: newUsername, onChange: (e) => setNewUsername(e.target.value) }), _jsx("button", { className: "update-button", onClick: handleUpdateUsername, children: "\u540D\u524D\u3092\u5909\u66F4\u3059\u308B" })] }), message && (_jsx("p", { className: isError ? "error-message" : "success-message", children: message }))] }), _jsx("button", { className: "toggle-theme-button", onClick: () => setIsDarkMode(!isDarkMode), children: isDarkMode ? "ライトモードにする" : "ダークモードにする" }), _jsx("button", { className: "logout-button", onClick: handleLogout, children: "\u30ED\u30B0\u30A2\u30A6\u30C8" })] })] }));
}
export default Settings;
