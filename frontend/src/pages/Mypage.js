import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function Mypage() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState("");
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarView, setCalendarView] = useState("week");
    const [calendarDate, setCalendarDate] = useState(new Date());
    const fetchTasks = async () => {
        try {
            const res = await fetch("http://localhost:3001/tasks");
            const data = await res.json();
            const formatted = data.map((task) => ({
                ...task,
                memo: task.memo ?? null,
                is_done: task.is_done ?? 0,
                title: task.category ?? "未分類",
                category_color: task.category_color ?? "#000000", // ← これ追加！
            }));
            setTasks(formatted);
        }
        catch (err) {
            console.error("タスク取得失敗", err);
        }
    };
    const handleDeleteAllCompleted = async () => {
        const confirmed = window.confirm("全ての完了したタスクを削除しますか？");
        if (!confirmed)
            return;
        try {
            await fetch("http://localhost:3001/tasks/completed", {
                method: "DELETE",
            });
            alert("完了タスクを全て削除しました！");
            fetchTasks();
        }
        catch (err) {
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
        }
        catch (err) {
            console.error("ユーザー情報取得失敗", err);
        }
    };
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
        }
        else {
            document.body.classList.remove("dark");
        }
    }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
        else {
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
        return _jsx("p", { className: "task-empty-message", children: "\u8A8D\u8A3C\u78BA\u8A8D\u4E2D..." });
    const incompleteTasks = tasks.filter((task) => task.is_done === 0);
    const completeTasks = tasks.filter((task) => task.is_done === 1);
    // 今日の日付 (0時にリセット)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // 今日の未完了タスクをフィルタ
    const todaysTasks = incompleteTasks.filter((task) => {
        if (!task.deadline)
            return false;
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
    return (_jsx("div", { style: { height: "100vh", overflowY: "auto" }, children: _jsxs("div", { className: "mypage-container", children: [_jsx(Link, { to: "/settings", children: _jsx("img", { src: gearIcon, alt: "\u8A2D\u5B9A\u30A2\u30A4\u30B3\u30F3", className: "gear-icon" }) }), _jsxs("h1", { className: "mypage-title", children: [username, " \u3055\u3093\u3001\u30DE\u30A4\u30DA\u30FC\u30B8\u3078\u3088\u3046\u3053\u305D\uFF01"] }), _jsx("p", { className: "mypage-subtitle", children: "\u4ECA\u65E5\u3082\uFF11\u65E5\u304C\u3093\u3070\u308A\u307E\u3057\u3087\u3046\uFF01\uD83C\uDF31\uD83C\uDF31" }), _jsxs("p", { className: "remaining-tasks", children: ["\u4ECA\u65E5\u306E\u6B8B\u308A\u306E\u30BF\u30B9\u30AF\uFF1A", todaysTasks.length, " \u4EF6"] }), _jsx(Link, { to: "/add-task", children: _jsx("button", { className: "submit-button", children: "\uFF0B \u30BF\u30B9\u30AF\u3092\u8FFD\u52A0\u3059\u308B" }) }), _jsx("button", { className: "submit-button", onClick: () => setIsCalendarOpen(true), children: "\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u3092\u8868\u793A" }), isCalendarOpen && (_jsx("div", { className: "calendar-modal-backdrop", children: _jsxs("div", { className: "calendar-modal-content", children: [_jsx("button", { className: "close-button", onClick: () => setIsCalendarOpen(false), children: "\u9589\u3058\u308B" }), _jsx("button", { className: "calendar-add-button", onClick: () => {
                                    setIsCalendarOpen(false);
                                    navigate("/calendar");
                                }, children: "\uFF0B \u30BF\u30B9\u30AF\u3092\u8FFD\u52A0" }), _jsx(Calendar, { localizer: localizer, events: tasks.map((task) => ({
                                    id: task.id,
                                    title: task.category ?? "未分類",
                                    start: task.start_time
                                        ? new Date(task.start_time)
                                        : new Date(),
                                    end: task.deadline ? new Date(task.deadline) : new Date(),
                                    category_color: task.category_color,
                                })), 
                                /// @ts-expect-error 型が合わないので無視
                                eventPropGetter: (event) => {
                                    const backgroundColor = event.category_color || "#ffca39";
                                    return {
                                        style: {
                                            backgroundColor,
                                            color: "white",
                                            borderRadius: "8px",
                                            padding: "2px",
                                        },
                                    };
                                }, startAccessor: "start", endAccessor: "end", titleAccessor: "title", selectable: false, views: ["month", "week", "day"], view: calendarView, onView: (view) => setCalendarView(view), date: calendarDate, onNavigate: (newDate) => setCalendarDate(newDate), style: { height: 500 }, messages: {
                                    month: "月",
                                    week: "週",
                                    day: "日",
                                    today: "今日",
                                    previous: "前",
                                    next: "次",
                                }, formats: {
                                    timeGutterFormat: (date, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => localizer.format(date, "HH:mm", culture),
                                    headerFormat: (date, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => localizer.format(date, "M月D日", culture),
                                    monthHeaderFormat: (date, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => localizer.format(date, "YYYY年M月", culture),
                                    dayRangeHeaderFormat: ({ start, end }, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => `${localizer.format(start, "YYYY年M月D日", culture)} - ${localizer.format(end, "YYYY年M月D日", culture)}`,
                                    agendaHeaderFormat: ({ start, end }, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => `${localizer.format(start, "YYYY年M月D日", culture)} - ${localizer.format(end, "YYYY年M月D日", culture)}`,
                                    dayHeaderFormat: (date, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => localizer.format(date, "YYYY年M月D日", culture),
                                    dayFormat: (date, culture, 
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    localizer) => localizer.format(date, "ddd", culture), // ← これだけ残す！
                                } })] }) })), _jsxs("div", { className: "task-columns", children: [_jsxs("div", { className: "task-column", children: [_jsx("h3", { children: "\u23F3 \u672A\u5B8C\u4E86" }), incompleteTasks.length === 0 ? (_jsx("p", { className: "task-empty-message", children: "\u672A\u5B8C\u4E86\u30BF\u30B9\u30AF\u306A\u3057" })) : (incompleteTasks.map((task) => (_jsx(TaskCard, { task: task, onStatusChange: fetchTasks, onDelete: fetchTasks }, task.id))))] }), _jsxs("div", { className: "task-column", children: [_jsxs("div", { className: "task-column-header", children: [_jsx("h3", { children: "\u2705 \u5B8C\u4E86" }), _jsx("button", { className: "delete-all-button", onClick: handleDeleteAllCompleted, children: _jsx("span", { className: "emoji", children: "\uD83D\uDDD1\uFE0F" }) })] }), completeTasks.length === 0 ? (_jsx("p", { className: "task-empty-message", children: "\u5B8C\u4E86\u30BF\u30B9\u30AF\u306A\u3057" })) : (completeTasks.map((task) => (_jsx(TaskCard, { task: task, onStatusChange: fetchTasks, onDelete: fetchTasks }, task.id))))] })] })] }) }));
}
export default Mypage;
