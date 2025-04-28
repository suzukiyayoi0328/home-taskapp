import React, { useState, useEffect } from "react";
import "./EventModal.css";

type EventData = {
  category: string;
  start: Date;
  end: Date;
  memo: string;
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
};

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  categories,
}) => {
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [memo, setMemo] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = Number(e.target.value);
    const category = categories.find((c) => c.id === selectedCategoryId);
    setCategoryId(selectedCategoryId);
    setSelectedColor(category ? category.category_color : null);
  };

  const formatDateTimeLocal = (date: Date) => {
    const offsetDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return offsetDate.toISOString().slice(0, 16);
  };

  // memo初期化
  useEffect(() => {
    if (initialData) {
      const categoryObj = categories.find(
        (c) => c.name === initialData.category
      );
      setCategoryId(categoryObj ? categoryObj.id : "");
      setSelectedColor(categoryObj ? categoryObj.category_color : null);
      setStart(initialData.start);
      setEnd(initialData.end);
      setMemo(initialData.memo || "");
    } else {
      setCategoryId("");
      setSelectedColor(null);
      setStart(null);
      setEnd(null);
      setMemo("");
    }
  }, [initialData, categories]);

  const handleSave = () => {
    if (!start || !end || categoryId === "") {
      alert("カテゴリ、開始日時、終了日時は必須です！");
      return;
    }

    const categoryName =
      categories.find((c) => c.id === categoryId)?.name || "";

    onSave({
      category: categoryName,
      start,
      end,
      memo,
    });
    onClose();
  };

  return (
    <>
      {/* 戻るボタン（画面左上固定） */}
      <div className="back-button">
        <a href="/mypage">← マイページ</a>
      </div>

      {/* モーダル本体 */}
      {isOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>予定追加 / 編集</h2>

            <div className="form-group">
              <label>カテゴリ</label>
              <div className="category-row">
                <select
                  value={categoryId}
                  onChange={handleCategoryChange}
                  className="category-select"
                  required
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
                  style={{
                    backgroundColor: selectedColor || "transparent",
                  }}
                ></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="memo">メモ</label>
              <textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力してください"
                rows={4}
              />
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

            <div className="button-row">
              <button onClick={handleSave}>保存</button>
              {onDelete && <button onClick={onDelete}>削除</button>}
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
