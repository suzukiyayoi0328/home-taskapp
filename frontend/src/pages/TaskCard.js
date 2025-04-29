import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import "./TaskCard.css";
function TaskCard({ task, onStatusChange, onDelete, }) {
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
        }
        catch (err) {
            console.error("更新失敗", err);
        }
    };
    const handleDelete = async () => {
        const confirmDelete = window.confirm("本当に削除しますか？");
        if (!confirmDelete)
            return;
        try {
            await fetch(`http://localhost:3001/tasks/${task.id}`, {
                method: "DELETE",
            });
            onDelete();
        }
        catch (err) {
            console.error("削除失敗", err);
            alert("削除に失敗しました");
        }
    };
    return (_jsxs("div", { className: `task-card ${task.is_done === 1 ? "done" : ""}`, style: {
            position: "relative",
            border: "1px solid #ccc",
            padding: "1em",
            marginBottom: "1em",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
        }, children: [_jsxs("div", { style: {
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    display: "flex",
                    gap: "8px",
                }, children: [_jsx(Link, { to: `/edit-task/${task.id}`, children: _jsx("button", { className: "task-edit-button", children: "\u270F\uFE0F" }) }), _jsx("button", { className: "task-delete-button", onClick: handleDelete, children: "\uD83D\uDDD1\uFE0F" })] }), _jsxs("div", { className: "task-title", style: { display: "flex", alignItems: "center" }, children: [_jsx("input", { type: "checkbox", checked: task.is_done === 1, onChange: handleCheckboxChange, style: { marginRight: "0.5em" } }), _jsx("h3", { style: { margin: 0 }, children: task.category || "カテゴリなし" })] }), _jsx("p", { className: "task-memo", style: { margin: "0.5em 0", color: "#999" }, children: task.memo || "メモなし" }), _jsxs("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }, children: [_jsxs("div", { children: [_jsxs("p", { className: "task-datetime", style: { margin: 0 }, children: ["\u958B\u59CB:", " ", task.start_time && !isNaN(Date.parse(task.start_time))
                                        ? new Date(task.start_time).toLocaleString("ja-JP", {
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "なし"] }), _jsxs("p", { className: "task-datetime", style: { margin: 0 }, children: ["\u7D42\u4E86:", " ", task.deadline && !isNaN(Date.parse(task.deadline))
                                        ? new Date(task.deadline).toLocaleString("ja-JP", {
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "なし"] })] }), _jsx("p", { style: { margin: 0, color: "#f44336", fontWeight: "bold" }, children: task.deadline
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
                                }
                                else {
                                    // 期限切れ
                                    const absDiffMs = Math.abs(diffMs);
                                    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
                                    const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
                                    if (diffHours >= 24) {
                                        text = `${Math.floor(diffHours / 24)}日切れ`;
                                    }
                                    else if (diffHours >= 1) {
                                        text = `${diffHours}時間切れ`;
                                    }
                                    else {
                                        text = `${diffMinutes}分切れ`;
                                    }
                                    color = "#f44336"; // 期限切れは赤
                                }
                                return (_jsx("span", { style: { color, fontWeight: "bold" }, children: text }));
                            })()
                            : "" })] })] }));
}
export default TaskCard;
