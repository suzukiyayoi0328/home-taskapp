import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AddTask.css";

function AddTask() {
  const [startTime, setStartTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");

  const [categories, setCategories] = useState<
    { id: number; name: string; category_color: string | null }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    const catObj = categories.find((c) => c.name === selectedCategory);
    setSelectedColor(catObj ? catObj.category_color : null);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/categories"
        );
        console.log("📋 カテゴリ一覧取得:", response.data);
        setCategories(response.data);
      } catch (error) {
        console.error("❌ カテゴリ取得エラー:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/tasks", {
        memo,
        start_time: startTime,
        deadline,
        category,
      });

      console.log("✅ 登録成功:", response.data);
      alert("タスクが登録されました！");
      navigate("/mypage");
    } catch (error) {
      console.error("❌ 登録エラー:", error);
      alert("登録に失敗しました…");
    }
  };

  return (
    <div className="add-task-page">
      <div className="add-task-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← マイページに戻る
        </button>
        <h2 className="login-title">タスクを追加</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>カテゴリ</label>
            <div className="category-row">
              <select
                value={category}
                onChange={handleCategoryChange}
                className="category-select"
                required
              >
                <option value="">選択してください</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {/* 常に表示しておく */}
              <div
                className="color-preview"
                style={{
                  backgroundColor: selectedColor || "transparent", // 未選択時は透明
                }}
              ></div>
            </div>
            <Link to="/edit-category">＋ カテゴリを編集</Link>
          </div>

          <div className="form-group">
            <label>メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>開始日時</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>終了日時</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <div style={{ marginTop: "10px" }}>
              <Link to="/calendar">📅 カレンダーから設定</Link>
            </div>
          </div>

          <button type="submit" className="submit-button">
            登録する
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTask;
