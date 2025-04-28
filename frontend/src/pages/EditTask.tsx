import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./EditTask.css";

type Task = {
  id: number;
  start_time: string | null;
  deadline: string | null;
  category: string | null;
  memo: string | null;
  is_done: number;
};

function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<
    { id: number; name: string; category_color: string }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // ← カラー用 state 追加

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("カテゴリ取得失敗", err);
      }
    };

    const fetchTask = async () => {
      const res = await fetch("http://localhost:3001/tasks/" + id);
      const data = await res.json();
      setTask(data);
    };

    fetchCategories();
    fetchTask();
  }, [id]);

  // task と categories が揃ったらカラーをセット
  useEffect(() => {
    if (task && categories.length > 0) {
      const color =
        categories.find((cat) => cat.name === task.category)?.category_color ||
        null;
      setSelectedColor(color);
    }
  }, [task, categories]);

  const handleSave = async () => {
    const sendData = {
      ...task,
      memo: task?.memo ?? "",
    };

    console.log("💾 保存するデータ:", sendData);

    try {
      await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      alert("更新しました！");
      navigate("/mypage");
    } catch (err) {
      console.error("保存失敗", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="edit-task-page">
      <div className="edit-task-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← マイページに戻る
        </button>
        <h2 className="login-title">タスクを編集</h2>
        {task ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="form-group">
              <label>カテゴリ</label>
              <div className="category-row">
                <select
                  value={task.category ?? ""}
                  onChange={(e) => {
                    const selectedCategory = e.target.value;
                    setTask({ ...task, category: selectedCategory });
                    const color =
                      categories.find((cat) => cat.name === selectedCategory)
                        ?.category_color || null;
                    setSelectedColor(color);
                  }}
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
                value={task.memo ?? ""}
                onChange={(e) => setTask({ ...task, memo: e.target.value })}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>開始日時</label>
              <input
                type="datetime-local"
                value={task.start_time ? task.start_time.slice(0, 16) : ""}
                onChange={(e) =>
                  setTask({ ...task, start_time: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>終了日時</label>
              <input
                type="datetime-local"
                value={task.deadline ? task.deadline.slice(0, 16) : ""}
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </div>
            <div className="calendar-link">
              <Link to="/calendar">📅 カレンダーから設定</Link>
            </div>
            <button type="submit" className="submit-button">
              保存する
            </button>
          </form>
        ) : (
          <p>読み込み中...</p>
        )}
      </div>
    </div>
  );
}

export default EditTask;
