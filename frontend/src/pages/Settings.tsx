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
    } else {
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
      } catch (err) {
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
      const res = await fetch(
        "http://localhost:3001/api/users/update-username",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );

      const data = await res.json();
      setMessage(data.message);
      setIsError(false);
    } catch (err) {
      console.error("ユーザー名更新失敗", err);
      setMessage("更新に失敗しました");
      setIsError(true);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("ログアウトしますか？");
    if (!confirmed) return;

    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="settings-page">
      <button className="back-button" onClick={() => navigate("/mypage")}>
        ← マイページに戻る
      </button>
      <div className="settings-card">
        <h1 className="settings-title">設定</h1>
        <p className="settings-description">ここで設定ができます。</p>

        <div className="form-group">
          <p className="email-display">{newUsername} さん</p>

          <label>プロフィール名</label>
          <div className="input-with-button">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <button className="update-button" onClick={handleUpdateUsername}>
              名前を変更する
            </button>
          </div>

          {message && (
            <p className={isError ? "error-message" : "success-message"}>
              {message}
            </p>
          )}
        </div>

        {/* 🌙 ダークモード切替ボタン */}
        <button
          className="toggle-theme-button"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? "ライトモードにする" : "ダークモードにする"}
        </button>

        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </div>
  );
}

export default Settings;
