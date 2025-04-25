import React, { useState, useEffect } from "react";
import "./EventModal.css";

type EventData = {
  category: string; // ← ここはIDでもOK！（使いやすい方で）
  start: Date;
  end: Date;
  memo: string; // ← ★ 追加！
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
  const [categoryId, setCategoryId] = useState<number | "">(""); // IDで管理
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [memo, setMemo] = useState<string>(""); // ← 型明示＆初期値空文字
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = Number(e.target.value);
    const category = categories.find((c) => c.id === selectedCategoryId); // ← ここもIDで比較！
    setCategoryId(selectedCategoryId);
    setSelectedColor(category ? category.category_color : null);
  };

  const formatDateTimeLocal = (date: Date) => {
    const offsetDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return offsetDate.toISOString().slice(0, 16);
  };

  // ★ useEffectでmemoも初期化！
  useEffect(() => {
    if (initialData) {
      const categoryObj = categories.find(
        (c) => c.name === initialData.category
      );
      setCategoryId(categoryObj ? categoryObj.id : "");
      setSelectedColor(categoryObj ? categoryObj.category_color : null);
      setStart(initialData.start);
      setEnd(initialData.end);
      setMemo(initialData.memo || ""); // ← ここ追加！
    } else {
      setCategoryId("");
      setSelectedColor(null);
      setStart(null);
      setEnd(null);
      setMemo(""); // ← 初期化
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
      memo, // ← ここも渡す！
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>予定追加 / 編集</h2>

        <label>カテゴリ</label>
        <div className="category-row">
          <select
            value={categoryId}
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
          {/* 常に表示しておく */}
          <div
            className="color-preview"
            style={{
              backgroundColor: selectedColor || "transparent", // 未選択時は透明
            }}
          ></div>
        </div>

        {/* メモ欄 */}
        <label htmlFor="memo">メモ</label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモを入力してください"
        ></textarea>

        <label>開始日時</label>
        <input
          type="datetime-local"
          value={start ? formatDateTimeLocal(start) : ""}
          onChange={(e) => setStart(new Date(e.target.value))}
        />

        <label>終了日時</label>
        <input
          type="datetime-local"
          value={end ? formatDateTimeLocal(end) : ""}
          onChange={(e) => setEnd(new Date(e.target.value))}
        />

        <div className="button-row">
          <button onClick={handleSave}>保存</button>
          {onDelete && <button onClick={onDelete}>削除</button>}
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};

export type { EventData };
export default EventModal;
