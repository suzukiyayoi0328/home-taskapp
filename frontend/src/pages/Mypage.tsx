import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TaskCard from "./TaskCard";
import "./Mypage.css";
import gearIcon from "../assets/noun-setting-4214910.svg";
import moment from "moment-timezone";
import { momentLocalizer } from "react-big-calendar";

import { Calendar } from "react-big-calendar";
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

// Calendarイベント用の型定義を追加
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

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:3001/tasks");
      const data = await res.json();
      const formatted = data.map((task: Omit<Task, "title">) => ({
        ...task,
        memo: task.memo ?? null,
        is_done: task.is_done ?? 0,
        title: task.category ?? "未分類",
        category_color: task.category_color ?? "#000000", // ← これ追加！
      }));
      setTasks(formatted);
    } catch (err) {
      console.error("タスク取得失敗", err);
    }
  };

  const handleDeleteAllCompleted = async () => {
    const confirmed = window.confirm("全ての完了したタスクを削除しますか？");
    if (!confirmed) return;
    try {
      await fetch("http://localhost:3001/tasks/completed", {
        method: "DELETE",
      });
      alert("完了タスクを全て削除しました！");
      fetchTasks();
    } catch (err) {
      console.error("全削除失敗", err);
      alert("削除に失敗しました");
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const name = data.username ?? data.email?.split("@")[0] ?? "ユーザー";
      setUsername(name);
    } catch (err) {
      console.error("ユーザー情報取得失敗", err);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
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

  const incompleteTasks = tasks.filter((task) => task.is_done === 0);
  const completeTasks = tasks.filter((task) => task.is_done === 1);

  // 今日の日付 (0時にリセット)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今日の未完了タスクをフィルタ
  const todaysTasks = incompleteTasks.filter((task) => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  return (
    <div style={{ height: "100vh", overflowY: "auto" }}>
      <div className="mypage-container">
        <Link to="/settings">
          <img src={gearIcon} alt="設定アイコン" className="gear-icon" />
        </Link>
        <h1 className="mypage-title">
          {username} さん、マイページへようこそ！
        </h1>
        <p className="mypage-subtitle">今日も１日がんばりましょう！🌱🌱</p>
        <p className="remaining-tasks">
          今日の残りのタスク：{todaysTasks.length} 件
        </p>
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
                    ? new Date(task.start_time)
                    : new Date(),
                  end: task.deadline ? new Date(task.deadline) : new Date(),
                  category_color: task.category_color,
                }))}
                /// @ts-expect-error 型が合わないので無視
                eventPropGetter={(event: CalendarEvent) => {
                  const backgroundColor = event.category_color || "#ffca39";
                  return {
                    style: {
                      backgroundColor,
                      color: "white",
                      borderRadius: "8px",
                      padding: "2px",
                    },
                  };
                }}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                selectable={false}
                views={["month", "week", "day"]}
                view={calendarView}
                onView={(view: "month" | "week" | "day") =>
                  setCalendarView(view)
                }
                date={calendarDate}
                onNavigate={(newDate: Date) => setCalendarDate(newDate)}
                style={{ height: 500 }}
                messages={{
                  month: "月",
                  week: "週",
                  day: "日",
                  today: "今日",
                  previous: "前",
                  next: "次",
                }}
                formats={{
                  timeGutterFormat: (
                    date: Date,
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) => localizer.format(date, "HH:mm", culture),

                  headerFormat: (
                    date: Date,
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) => localizer.format(date, "M月D日", culture),

                  monthHeaderFormat: (
                    date: Date,
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) => localizer.format(date, "YYYY年M月", culture),

                  dayRangeHeaderFormat: (
                    { start, end }: { start: Date; end: Date },
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) =>
                    `${localizer.format(
                      start,
                      "YYYY年M月D日",
                      culture
                    )} - ${localizer.format(end, "YYYY年M月D日", culture)}`,

                  agendaHeaderFormat: (
                    { start, end }: { start: Date; end: Date },
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) =>
                    `${localizer.format(
                      start,
                      "YYYY年M月D日",
                      culture
                    )} - ${localizer.format(end, "YYYY年M月D日", culture)}`,

                  dayHeaderFormat: (
                    date: Date,
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) => localizer.format(date, "YYYY年M月D日", culture),

                  dayFormat: (
                    date: Date,
                    culture: string | undefined,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    localizer: any
                  ) => localizer.format(date, "ddd", culture), // ← これだけ残す！
                }}
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
                  onDelete={fetchTasks}
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
                <span className="emoji">🗑️</span>
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
    </div>
  );
}

export default Mypage;
