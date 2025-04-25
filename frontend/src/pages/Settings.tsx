import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🎫 トークン取得 (fetchUser):", token); // ✅ 追加！

        const res = await fetch("http://localhost:3001/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("📡 /me レスポンスステータス:", res.status); // ✅

        const data = await res.json();
        console.log("📨 /me レスポンスデータ:", data); // ✅

        if (!data.email) {
          throw new Error("メールアドレスが取得できませんでした");
        }

        const displayName = data.username ?? data.email.split("@")[0];
        console.log("👤 表示名（初期値）:", displayName); // ✅
        setNewUsername(displayName);
      } catch (err) {
        console.error("ユーザー情報取得失敗", err);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateUsername = async () => {
    console.log("⚙️ 更新ボタンが押されました"); // ✅ ボタン押下確認

    if (!newUsername.trim()) {
      console.log("⚠️ ユーザー名が空です"); // ✅
      setMessage("ユーザー名を入力してください");
      setIsError(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("🎫 トークン取得 (handleUpdateUsername):", token); // ✅

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

      console.log("📡 /update-username ステータス:", res.status); // ✅

      const data = await res.json();
      console.log("📨 /update-username レスポンス:", data); // ✅

      setMessage(data.message);
      setIsError(false);
    } catch (err) {
      console.error("❌ ユーザー名更新失敗", err);
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

        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </div>
  );
}

export default Settings;
