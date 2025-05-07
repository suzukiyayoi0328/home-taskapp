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
  attachment_url: string | null;
};

function toLocalDatetimeInputValue(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatToMySQLDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<
    { id: number; name: string; category_color: string }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [repeatType, setRepeatType] = useState("");

  const [memo, setMemo] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string; type: string }[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        console.error("カテゴリ取得失敗", err);
      }
    };

    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3001/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setTask(data);
        setMemo(data.memo ?? "");
        setRepeatType(data.repeat_type || "");

        if (data.attachment_url) {
          const urls = data.attachment_url.split(",");
          const initialFiles = urls.map((url: string) => ({
            name: url.split("/").pop() || "ファイル",
            url,
            type: /\.(png|jpe?g|gif|webp)$/i.test(url)
              ? "image/*"
              : "application/octet-stream",
          }));
          setUploadedFiles(initialFiles);
        }
      } catch (err) {
        console.error("タスク取得失敗", err);
      }
    };

    fetchCategories();
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (task && categories.length > 0) {
      const color =
        categories.find((cat) => String(cat.id) === task.category)
          ?.category_color || null;
      setSelectedColor(color);
    }
  }, [task, categories]);

  const handleSave = async () => {
    const categoryId = task?.category ? Number(task.category) : null;

    if (!categoryId || !task?.start_time || !task?.deadline) {
      setErrorMessage("カテゴリと開始・終了日時は必須です。");
      return;
    }

    if (new Date(task.start_time) >= new Date(task.deadline)) {
      setErrorMessage("開始日時は終了日時より前に設定してください。");
      return;
    }

    setErrorMessage("");

    const repeatCount = 4;
    const baseStart = new Date(task.start_time);
    const baseEnd = new Date(task.deadline);

    const createPayload = (start: Date, end: Date) => ({
      category: categoryId,
      start_time: formatToMySQLDateTime(start),
      deadline: formatToMySQLDateTime(end),
      memo: memo.trim() === "" ? null : memo.trim(),
      attachment_url: uploadedFiles.map((f) => f.url).join(",") || null,
      repeat_type: repeatType || "",
    });

    try {
      if (repeatType === "weekly" || repeatType === "monthly") {
        try {
          await axios.post(
            "http://localhost:3001/tasks/repeat-group/delete",
            {
              category: categoryId,
              memo: memo.trim() === "" ? null : memo.trim(),
              repeat_type: repeatType,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        } catch (deleteErr) {
          console.error("❌ 既存の繰り返し削除失敗:", deleteErr);
        }

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
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
      } else {
        const payload = createPayload(baseStart, baseEnd);
        await axios.put(`http://localhost:3001/tasks/${id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      localStorage.setItem("taskUpdated", "true");
      navigate("/mypage", {
        state: { toast: { message: "更新しました！", type: "success" } },
      });
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
                    const selectedCategoryId = e.target.value;
                    setTask({ ...task, category: selectedCategoryId });
                    const color =
                      categories.find(
                        (cat) => String(cat.id) === selectedCategoryId
                      )?.category_color || null;
                    setSelectedColor(color);
                  }}
                  className="category-select"
                >
                  <option value="">選択してください</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <div
                  className="color-preview"
                  style={{
                    backgroundColor: selectedColor || "transparent",
                  }}
                ></div>
              </div>

              {errorMessage && errorMessage.includes("カテゴリ") && (
                <div className="left-error-message">{errorMessage}</div>
              )}

              <Link to="/edit-category">＋ カテゴリを編集</Link>
            </div>

            <div className="form-group">
              <label>メモ</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
              />

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
                      const res = await fetch("https://file.io", {
                        method: "POST",
                        body: formData,
                      });
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
                  setMemo((prev) =>
                    [
                      ...prev,
                      ...newFiles.map((f) => `${f.name}: ${f.url}`),
                    ].join("\n")
                  );
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
                          {file.name}
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
                value={
                  task.start_time
                    ? toLocalDatetimeInputValue(task.start_time)
                    : ""
                }
                onChange={(e) =>
                  setTask({ ...task!, start_time: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>終了日時</label>
              <input
                type="datetime-local"
                value={
                  task.deadline ? toLocalDatetimeInputValue(task.deadline) : ""
                }
                onChange={(e) =>
                  setTask({ ...task!, deadline: e.target.value })
                }
              />
            </div>

            {errorMessage &&
              (errorMessage.includes("開始") ||
                errorMessage.includes("終了")) && (
                <div className="left-error-message">{errorMessage}</div>
              )}

            <div className="form-group">
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

      {memo && memo.includes("https://") && (
        <div className="attached-file-preview">
          {(() => {
            const urlLine = memo
              .split("\n")
              .find((line) => line.includes("https://"));
            if (!urlLine) return null;

            const urlMatch = urlLine.match(/https:\/\/[^\s]+/);
            const url = urlMatch ? urlMatch[0] : "";
            const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);

            return isImage ? (
              <img
                src={url}
                alt="添付画像"
                style={{ maxWidth: "100%", marginTop: "10px" }}
              />
            ) : (
              <div style={{ marginTop: "10px" }}>
                <span>📎 添付ファイル: </span>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  開く
                </a>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default EditTask;
