import React, { useState, useEffect } from "react";
import "./EventModal.css";

type EventData = {
  category: string;
  start: Date;
  end: Date;
  memo: string | null;
  attachment_url?: string | null;
  repeat_type?: "weekly" | "monthly" | "";
};

type Category = {
  id: number;
  name: string;
  category_color: string | null;
};

type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventData) => void;
  onDelete?: () => void;
  initialData?: EventData;
  categories: Category[];
  onShowToast: (message: string, type: "success" | "delete") => void;
};
const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  categories,
  onShowToast,
}) => {
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [memo, setMemo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [repeatType, setRepeatType] = useState<"weekly" | "monthly" | "">("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string; type: string }[]
  >([]);

  const isEdit = !!initialData;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;

    if (selected === "") {
      setCategoryId(null);
      setSelectedColor(null);
    } else {
      const selectedCategoryId = Number(selected);

      const category = categories.find(
        (c) => Number(c.id) === selectedCategoryId
      );

      setCategoryId(selectedCategoryId);
      setSelectedColor(category ? category.category_color : null);
    }
  };
  const formatDateTimeLocal = (date: Date) => {
    const offsetDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return offsetDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (initialData && categories.length > 0) {
      //カテゴリ名 or ID の両方に対応
      const categoryObj =
        categories.find((c) => String(c.id) === initialData.category) ||
        categories.find((c) => c.name === initialData.category);

      if (categoryObj) {
        setCategoryId(categoryObj.id);
        setSelectedColor(categoryObj.category_color || null);
      } else {
        setCategoryId(null);
        setSelectedColor(null);
      }

      setStart(new Date(initialData.start));
      setEnd(new Date(initialData.end));
      setMemo(initialData.memo || "");
      setRepeatType(initialData.repeat_type || "");

      if (initialData.attachment_url) {
        const urls = initialData.attachment_url.split(",");
        const initialFiles = urls.map((url: string) => ({
          name: url.split("/").pop() || "ファイル",
          url,
          type: /\.(png|jpe?g|gif|webp)$/i.test(url)
            ? "image/*"
            : "application/octet-stream",
        }));
        setUploadedFiles(initialFiles);
      }
    }
  }, [initialData, categories]);

  function formatToMySQLDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000); // JSTに補正
    return `${jst.getFullYear()}-${pad(jst.getMonth() + 1)}-${pad(
      jst.getDate()
    )} ${pad(jst.getHours())}:${pad(jst.getMinutes())}:00`;
  }

  const handleSave = async () => {
    if (!start) {
      setErrorMessage("開始日時は必須です。");
      return;
    }

    if (!end) {
      setErrorMessage("終了日時は必須です。");
      return;
    }

    if (start >= end) {
      setErrorMessage("開始日時は終了日時より前に設定してください。");
      return;
    }

    if (!categoryId || isNaN(Number(categoryId))) {
      setErrorMessage("カテゴリは必須です。");
      return;
    }

    setErrorMessage("");

    const repeatCount = repeatType ? 4 : 1;

    const createPayload = (s: Date, e: Date) => ({
      category: String(categoryId),
      start: new Date(formatToMySQLDateTime(s)),
      end: new Date(formatToMySQLDateTime(e)),
      memo: memo.trim() === "" ? null : memo.trim(),
      attachment_url: uploadedFiles.map((f) => f.url).join(","),
      repeat_type: repeatType,
    });

    for (let i = 0; i < repeatCount; i++) {
      const s = new Date(start);
      const e = new Date(end);

      if (repeatType === "weekly") {
        s.setDate(s.getDate() + i * 7);
        e.setDate(e.getDate() + i * 7);
      } else if (repeatType === "monthly") {
        s.setMonth(s.getMonth() + i);
        e.setMonth(e.getMonth() + i);
      }

      onSave(createPayload(s, e));
    }

    onShowToast(
      isEdit
        ? "予定を更新しました！"
        : repeatType
        ? "繰り返し予定を追加しました！"
        : "予定を追加しました！",
      "success"
    );

    onClose();
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
      onShowToast("予定を削除しました！", "delete");
      onClose();
    }
  };

  return (
    <>
      <div className="back-button">
        <a href="/mypage">← マイページ</a>
      </div>

      {isOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>予定追加 / 編集</h2>

            <div className="form-group">
              <label>カテゴリ</label>
              <div className="category-row">
                <select
                  value={categoryId !== null ? String(categoryId) : ""}
                  onChange={handleCategoryChange}
                  className="category-select"
                >
                  <option value="">選択してください</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div
                  className="color-preview"
                  style={{ backgroundColor: selectedColor || "transparent" }}
                ></div>
              </div>
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
              <label>ファイルを添付</label>
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
                        "https://home-taskapp-backend.onrender.com/api/upload",
                        {
                          method: "POST",
                          body: formData,
                          headers: {
                            Authorization:
                              "Bearer " + localStorage.getItem("token"),
                          },
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
                value={start ? formatDateTimeLocal(start) : ""}
                onChange={(e) => setStart(new Date(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>終了日時</label>
              <input
                type="datetime-local"
                value={end ? formatDateTimeLocal(end) : ""}
                onChange={(e) => setEnd(new Date(e.target.value))}
              />
            </div>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            <div className="form-group">
              <label>繰り返し</label>
              <select
                value={repeatType}
                onChange={(e) =>
                  setRepeatType(e.target.value as "weekly" | "monthly" | "")
                }
                className="repeat-select"
              >
                <option value="">なし</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>

            <div className="button-row">
              <button onClick={handleSave}>{isEdit ? "保存" : "追加"}</button>
              {isEdit && onDelete && (
                <button onClick={handleDeleteClick}>削除</button>
              )}
              <button onClick={onClose}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export type { EventData };
export default EventModal;
