import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CategoryEdit.css";

function CategoryEdit() {
  const [name, setName] = useState(""); // カテゴリ名
  const [color, setColor] = useState("#ffca39"); // カラー（デフォルト色）
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  const colorOptions = [
    "#ffca39",
    "#ff9800",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#795548",
  ];

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
      const res = await axios.get("http://localhost:3001/api/categories");
      setCategories(res.data);
      setSelectedCategory("");
    } catch (err) {
      console.error("カテゴリ削除失敗", err);
      alert("削除に失敗しました…");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("カテゴリ名を入力してください！");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/categories", {
        name,
        category_color: color, // 色も送信
      });
      console.log("✅ カテゴリ追加成功:", res.data);
      setMessage("カテゴリを追加しました！");
      setName("");
      setColor("#ffca39"); // 初期色に戻す
    } catch (err) {
      console.error("❌ カテゴリ追加失敗", err);
      setMessage("カテゴリの追加に失敗しました…");
    }
  };

  return (
    <div className="category-edit-page">
      <div className="category-edit-card">
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

          {/* カラー選択欄 */}
          <div className="form-group">
            <label>カラー選択</label>
            <div className="color-palette">
              {colorOptions.map((c) => (
                <div
                  key={c}
                  className={`color-box ${color === c ? "selected" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
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
