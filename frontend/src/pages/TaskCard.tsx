import { Link } from "react-router-dom";
import "./TaskCard.css";

type Task = {
  id: number;
  title: string;
  start_time: string | null;
  deadline: string | null;
  category: string | null;
  memo: string | null;
  is_done: number;
  attachment_url?: string | null;
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
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
      await fetch(`${apiBaseUrl}/tasks/` + task.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ is_done: task.is_done === 1 ? 0 : 1 }),
      });
      onStatusChange();
    } catch (err) {
      console.error("更新失敗", err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (!confirmDelete) return;

    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

      await fetch(`${apiBaseUrl}/${task.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      onDelete();
    } catch (err) {
      console.error("削除失敗", err);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className={`task-card ${task.is_done === 1 ? "done" : ""}`}>
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

      <p className="task-memo" style={{ margin: "0.5em 0", color: "#999" }}>
        {task.memo || "メモなし"}
      </p>

      {task.attachment_url && (
        <div style={{ margin: "0.5em 0" }}>
          <a
            href={task.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", fontSize: "1.5em" }}
          >
            {(() => {
              const url = task.attachment_url.toLowerCase();
              if (url.match(/\.(png|jpe?g|gif|webp)$/)) {
                return "📷"; // 画像ファイル
              } else if (url.endsWith(".pdf")) {
                return "📄"; // PDF
              } else {
                return "📎"; // その他
              }
            })()}
          </a>
        </div>
      )}

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
                  text = `${diffDays}日`;
                  color = diffDays <= 3 ? "#f44336" : "#4caf50";
                } else {
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
                  color = "#f44336";
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
