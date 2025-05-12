import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TaskCard from "./TaskCard";
import "./Mypage.css";
import gearIcon from "../assets/noun-setting-4214910.svg";
import moment from "moment-timezone";
import { momentLocalizer, Calendar } from "react-big-calendar";
import "moment/locale/ja";

moment.locale("ja");
moment.tz.setDefault("Asia/Tokyo");

const localizer = momentLocalizer(moment);

type Task = {
  id: number;
  start_time: string | null;
  deadline: string | null;
  category: string | null;
  title: string;
  memo: string | null;
  is_done: number;
  category_color?: string;
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  category_color?: string;
};

function Mypage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [username, setUsername] = useState("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "week"
  );
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [toastText, setToastText] = useState("");

  useEffect(() => {
    const taskAdded = localStorage.getItem("taskAdded");
    const taskUpdated = localStorage.getItem("taskUpdated");
    if (taskAdded === "true" || taskUpdated === "true") {
      showToastWithFade(
        taskUpdated === "true"
          ? "タスクを更新しました！"
          : "タスクを追加しました！"
      );
      localStorage.removeItem("taskAdded");
      localStorage.removeItem("taskUpdated");
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://home-taskapp-backend.onrender.com/api/tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const formatted = data.map((task: Omit<Task, "title">) => ({
        ...task,
        memo: task.memo ?? null,
        is_done: task.is_done ?? 0,
        title: task.category ?? "未分類",
        category_color: task.category_color ?? "#000000",
      }));
      setTasks(formatted);
    } catch (err) {
      console.error("タスク取得失敗", err);
    }
  };

  const showToastWithFade = (text: string) => {
    setToastText(text);
    setShowToast(true);
    setIsFadingOut(false);
    setTimeout(() => setIsFadingOut(true), 3000);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleDeleteWithToast = async (taskId: number) => {
    try {
      await fetch(
        `https://home-taskapp-backend.onrender.com/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchTasks();
      showToastWithFade("タスクを削除しました！");
    } catch (err) {
      console.error("削除失敗", err);
      alert("削除に失敗しました");
    }
  };

  const handleDeleteAllCompleted = async () => {
    if (!window.confirm("全ての完了したタスクを削除しますか？")) return;
    try {
      await fetch(
        "https://home-taskapp-backend.onrender.com/api/yotasks/completed",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchTasks();
      showToastWithFade("完了したタスクをすべて削除しました！");
    } catch (err) {
      console.error("全削除失敗", err);
      alert("削除に失敗しました");
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://home-taskapp-backend.onrender.com/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setUsername(data.username ?? data.email?.split("@")[0] ?? "ユーザー");
    } catch (err) {
      console.error("ユーザー情報取得失敗", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthChecked) {
      fetchUser();
      fetchTasks();
    }
  }, [isAuthChecked]);

  if (!isAuthChecked)
    return <p className="task-empty-message">認証確認中...</p>;

  const incompleteTasks = tasks.filter((t) => t.is_done === 0);
  const completeTasks = tasks.filter((t) => t.is_done === 1);

  return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      <div className="mypage-container">
        <Link to="/settings">
          <img src={gearIcon} alt="設定" className="gear-icon" />
        </Link>
        <h1 className="mypage-title">
          {username} さん、マイページへようこそ！
        </h1>
        <p className="mypage-subtitle">今日も１日がんばりましょう！🌱🌱</p>

        <Link to="/add-task">
          <button className="submit-button">＋ タスクを追加する</button>
        </Link>
        <button
          className="submit-button"
          onClick={() => setIsCalendarOpen(true)}
        >
          📅 カレンダーを表示
        </button>

        {isCalendarOpen && (
          <div className="calendar-modal-backdrop">
            <div className="calendar-modal-content">
              <button
                className="close-button"
                onClick={() => setIsCalendarOpen(false)}
              >
                閉じる
              </button>
              <button
                className="calendar-add-button"
                onClick={() => {
                  setIsCalendarOpen(false);
                  navigate("/calendar");
                }}
              >
                ＋ タスクを追加
              </button>
              <Calendar
                localizer={localizer}
                events={tasks.map((task) => ({
                  id: task.id,
                  title: task.category ?? "未分類",
                  start: task.start_time
                    ? moment.tz(task.start_time, "Asia/Tokyo").toDate()
                    : new Date(),
                  end: task.deadline
                    ? moment.tz(task.deadline, "Asia/Tokyo").toDate()
                    : new Date(),
                  category_color: task.category_color,
                }))}
                // @ts-expect-error 型が合わないので無視
                eventPropGetter={(event: CalendarEvent) => ({
                  style: {
                    backgroundColor: event.category_color || "#ffca39",
                    color: "white",
                    borderRadius: "8px",
                    padding: "2px",
                  },
                })}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                selectable={false}
                views={["month", "week", "day"]}
                view={calendarView}
                // @ts-expect-error 型が合わないので無視
                onView={(view) => setCalendarView(view)}
                date={calendarDate}
                onNavigate={setCalendarDate}
                style={{ height: 500 }}
              />
            </div>
          </div>
        )}

        <div className="task-columns">
          <div className="task-column">
            <h3>⏳ 未完了</h3>
            {incompleteTasks.length === 0 ? (
              <p className="task-empty-message">未完了タスクなし</p>
            ) : (
              incompleteTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={fetchTasks}
                  onDelete={() => handleDeleteWithToast(task.id)}
                />
              ))
            )}
          </div>
          <div className="task-column">
            <div className="task-column-header">
              <h3>✅ 完了</h3>
              <button
                className="delete-all-button"
                onClick={handleDeleteAllCompleted}
              >
                🗑️
              </button>
            </div>
            {completeTasks.length === 0 ? (
              <p className="task-empty-message">完了タスクなし</p>
            ) : (
              completeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={fetchTasks}
                  onDelete={fetchTasks}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <div
          className={`toast ${
            toastText.includes("削除") ? "toast-delete" : "success-toast"
          } ${isFadingOut ? "hide" : ""}`}
        >
          {toastText}
        </div>
      )}
    </div>
  );
}

export default Mypage;
