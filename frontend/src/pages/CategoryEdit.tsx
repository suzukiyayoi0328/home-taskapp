import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CategoryEdit.css";

function CategoryEdit() {
  const [name, setName] = useState(""); // カテゴリ名
  const [message, setMessage] = useState(""); // 成功・エラーメッセージ
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("カテゴリ取得失敗", err);
      }
    };
    fetchCategories();
  }, []);

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await axios.delete(
        `http://localhost:3001/api/categories/${selectedCategory}`
      );
      alert("カテゴリを削除しました！");
      // 削除後の一覧再取得
      const res = await axios.get("http://localhost:3001/api/categories");
      setCategories(res.data);
      setSelectedCategory(""); // プルダウン初期化
    } catch (err) {
      console.error("カテゴリ削除失敗", err);
      alert("削除に失敗しました…");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault(); // フォーム送信防止

    if (!name.trim()) {
      setMessage("カテゴリ名を入力してください！");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/categories", {
        name,
      });
      console.log("✅ カテゴリ追加成功:", res.data);
      setMessage("カテゴリを追加しました！");
      setName(""); // フォームクリア
    } catch (err) {
      console.error("❌ カテゴリ追加失敗", err);
      setMessage("カテゴリの追加に失敗しました…");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">カテゴリを編集</h2>
        <form onSubmit={handleAddCategory}>
          <div className="form-group">
            <label>カテゴリ名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            追加する
          </button>

          <div className="form-group">
            <label>カテゴリ削除</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="delete-button"
              onClick={handleDeleteCategory}
            >
              削除する
            </button>
          </div>
        </form>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
        <button className="back-button" onClick={() => navigate(-1)}>
          ← タスクを編集に戻る
        </button>
      </div>
    </div>
  );
}

export default CategoryEdit;
