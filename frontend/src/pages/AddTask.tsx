import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AddTask.css";

function AddTask() {
  const [startTime, setStartTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [repeatType, setRepeatType] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string; type: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { id: number; name: string; category_color: string | null }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setCategory(selectedId.toString());

    const catObj = categories.find((c) => c.id === selectedId);
    setSelectedColor(catObj ? catObj.category_color : null);
  };

  function formatToMySQLDateTime(isoString: string): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3001/api/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("❌ カテゴリ取得エラー:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!startTime) {
      setErrorMessage("開始日時を入力してください。");
      return;
    }

    if (!deadline) {
      setErrorMessage("終了日時を入力してください。");
      return;
    }

    if (new Date(startTime) >= new Date(deadline)) {
      setErrorMessage("開始日時は終了日時より前に設定してください。");
      return;
    }

    const categoryObj = categories.find((cat) => cat.id === Number(category));
    const categoryId = categoryObj?.id;

    if (categoryId === undefined || categoryId === null) {
      setErrorMessage("カテゴリ選択は必須です。");
      return;
    }

    const baseStart = new Date(startTime);
    const baseEnd = new Date(deadline);
    const repeatCount = 4;

    const createPayload = (start: Date, end: Date) => ({
      memo,
      category: Number(categoryId),
      start_time: formatToMySQLDateTime(start.toISOString()),
      deadline: formatToMySQLDateTime(end.toISOString()),
      attachment_url: uploadedFiles.map((f) => f.url).join(","),
      repeat_type: repeatType || "",
    });

    try {
      if (repeatType === "weekly" || repeatType === "monthly") {
        for (let i = 0; i < repeatCount; i++) {
          const start = new Date(baseStart);
          const end = new Date(baseEnd);

          if (repeatType === "weekly") {
            start.setDate(start.getDate() + i * 7);
            end.setDate(end.getDate() + i * 7);
          } else if (repeatType === "monthly") {
            start.setMonth(start.getMonth() + i);
            end.setMonth(end.getMonth() + i);
          }

          const payload = createPayload(start, end);
          await axios.post("http://localhost:3001/tasks", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } else {
        const payload = createPayload(baseStart, baseEnd);
        await axios.post("http://localhost:3001/tasks", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      localStorage.setItem("taskAdded", "true");
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
              >
                <option value="">選択してください</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div
                className="color-preview"
                style={{ backgroundColor: selectedColor || "transparent" }}
              ></div>
            </div>
            <Link to="/edit-category">＋ カテゴリを編集</Link>
          </div>

          {errorMessage && errorMessage.includes("カテゴリ") && (
            <div className="left-error-message">{errorMessage}</div>
          )}

          <div className="form-group">
            <label>メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label style={{ marginTop: "10px", display: "block" }}>
              ファイルを添付
            </label>
            <input
              type="file"
              multiple
              onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;

                const newFiles: {
                  name: string;
                  url: string;
                  type: string;
                }[] = [];

                for (const file of files) {
                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const res = await fetch(
                      "http://localhost:3001/api/upload",
                      {
                        method: "POST",
                        body: formData,
                      }
                    );
                    const data = await res.json();

                    if (data.success && data.data?.url) {
                      newFiles.push({
                        name: file.name,
                        url: data.data.url,
                        type: file.type,
                      });
                    }
                  } catch (err) {
                    console.error("アップロードエラー:", err);
                  }
                }

                setUploadedFiles((prev) => [...prev, ...newFiles]);
              }}
            />
            {uploadedFiles.length > 0 && (
              <div className="file-preview-area">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-preview">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt="preview"
                        className="preview-image"
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name} を添付しました
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
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

            {errorMessage &&
              (errorMessage.includes("開始") ||
                errorMessage.includes("終了")) && (
                <div className="error-message">{errorMessage}</div>
              )}

            <div className="form-group repeat-group">
              <label>繰り返し</label>
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value)}
                className="repeat-select"
              >
                <option value="">なし</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>

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
