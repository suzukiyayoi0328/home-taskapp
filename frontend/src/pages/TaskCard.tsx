import { Link } from "react-router-dom";
import "./TaskCard.css";

type Task = {
  id: number;
  title: string;
  start_time: string | null;
  deadline: string | null; // ← これが終了時間
  category: string | null;
  memo: string | null;
  is_done: number;
};

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: () => void;
  onDelete: () => void;
}) {
  const handleCheckboxChange = async () => {
    console.log("チェックボックス押した！ 現在のis_done:", task.is_done); // 追加
    try {
      await fetch("http://localhost:3001/tasks/" + task.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_done: task.is_done === 1 ? 0 : 1 }),
      });
      console.log("PATCHリクエスト送信完了"); // 追加
      onStatusChange();
    } catch (err) {
      console.error("更新失敗", err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: "DELETE",
      });
      onDelete();
    } catch (err) {
      console.error("削除失敗", err);
      alert("削除に失敗しました");
    }
  };

  return (
    <div
      className={`task-card ${task.is_done === 1 ? "done" : ""}`}
      style={{
        position: "relative",
        border: "1px solid #ccc",
        padding: "1em",
        marginBottom: "1em",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 編集・削除ボタン */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          gap: "8px",
        }}
      >
        <Link to={`/edit-task/${task.id}`}>
          <button className="task-edit-button">✏️</button>
        </Link>
        <button className="task-delete-button" onClick={handleDelete}>
          🗑️
        </button>
      </div>

      {/* ✅ カテゴリ名とチェックボックス */}
      <div
        className="task-title"
        style={{ display: "flex", alignItems: "center" }}
      >
        <input
          type="checkbox"
          checked={task.is_done === 1}
          onChange={handleCheckboxChange}
          style={{ marginRight: "0.5em" }}
        />
        <h3 style={{ margin: 0 }}>{task.category || "カテゴリなし"}</h3>
      </div>

      {/* メモ */}
      <p className="task-memo" style={{ margin: "0.5em 0", color: "#999" }}>
        {task.memo || "メモなし"}
      </p>
      {/* 開始日時 + 終了日時 */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p className="task-datetime" style={{ margin: 0 }}>
            開始:{" "}
            {task.start_time && !isNaN(Date.parse(task.start_time))
              ? new Date(task.start_time).toLocaleString("ja-JP", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "なし"}
          </p>
          <p className="task-datetime" style={{ margin: 0 }}>
            終了:{" "}
            {task.deadline && !isNaN(Date.parse(task.deadline))
              ? new Date(task.deadline).toLocaleString("ja-JP", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "なし"}
          </p>
        </div>

        {/* 残り */}
        <p style={{ margin: 0, color: "#f44336", fontWeight: "bold" }}>
          {task.deadline
            ? (() => {
                const now = new Date().getTime();
                const deadline = new Date(task.deadline).getTime();
                const diffMs = deadline - now;
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                let text = "";
                let color = "";

                if (diffMs >= 0) {
                  // 期限内
                  text = `${diffDays}日`;
                  color = diffDays <= 3 ? "#f44336" : "#4caf50"; // 3日以内なら赤、4日以上は黄緑
                } else {
                  // 期限切れ
                  const absDiffMs = Math.abs(diffMs);
                  const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
                  const diffMinutes = Math.floor(absDiffMs / (1000 * 60));

                  if (diffHours >= 24) {
                    text = `${Math.floor(diffHours / 24)}日切れ`;
                  } else if (diffHours >= 1) {
                    text = `${diffHours}時間切れ`;
                  } else {
                    text = `${diffMinutes}分切れ`;
                  }
                  color = "#f44336"; // 期限切れは赤
                }

                return (
                  <span style={{ color, fontWeight: "bold" }}>{text}</span>
                );
              })()
            : ""}
        </p>
      </div>
    </div>
  );
}

export default TaskCard;
