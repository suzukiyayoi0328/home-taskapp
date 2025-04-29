import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, momentLocalizer, } from "react-big-calendar";
import moment from "moment-timezone";
import "moment/locale/ja";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useCallback } from "react";
import "./CalendarPage.css";
import EventModal from "./EventModal";
import { useNavigate } from "react-router-dom";
moment.locale("ja");
moment.tz.setDefault("Asia/Tokyo");
const localizer = momentLocalizer(moment);
function CalendarPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [categories, setCategories] = useState([]);
    const [currentView, setCurrentView] = useState("week");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3001/tasks");
            const data = await res.json();
            console.log("📦 タスク一覧取得結果:", data);
            const formatted = data.map((task) => ({
                id: task.id,
                category: task.category || "",
                category_color: task.category_color || null,
                start: new Date(task.start_time), // ← ここ補正なしでOK！
                end: new Date(task.deadline),
            }));
            setEvents(formatted);
        }
        catch (err) {
            console.error("タスク取得エラー:", err);
        }
    }, []);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/categories");
                const data = await res.json();
                console.log("カテゴリ一覧:", data);
                setCategories(data);
            }
            catch (err) {
                console.error("カテゴリ取得エラー:", err);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    const handleSelectSlot = (slotInfo) => {
        setSelectedSlot(slotInfo);
        setSelectedEvent(null);
        setIsModalOpen(true);
    };
    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setSelectedSlot(null);
        setIsModalOpen(true);
    };
    const handleSaveEvent = async (data) => {
        const formatDate = (date) => {
            return moment(date).format("YYYY-MM-DD HH:mm:ss");
        };
        const isEdit = !!selectedEvent;
        const url = isEdit
            ? `http://localhost:3001/tasks/${selectedEvent.id}`
            : "http://localhost:3001/tasks";
        const method = isEdit ? "PUT" : "POST";
        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_time: formatDate(data.start),
                    deadline: formatDate(data.end),
                    category: data.category,
                    memo: data.memo,
                }),
            });
            fetchTasks();
        }
        catch (err) {
            console.error("保存エラー:", err);
        }
        setIsModalOpen(false);
    };
    const handleDeleteEvent = async () => {
        if (!selectedEvent)
            return;
        try {
            await fetch(`http://localhost:3001/tasks/${selectedEvent.id}`, {
                method: "DELETE",
            });
            fetchTasks();
        }
        catch (err) {
            console.error("削除エラー:", err);
        }
        setIsModalOpen(false);
    };
    return (_jsxs("div", { className: "calendar-wrapper", children: [_jsx("button", { className: "back-button", onClick: () => navigate("/mypage"), children: "\u2190 \u30DE\u30A4\u30DA\u30FC\u30B8" }), _jsxs("div", { className: "calendar-inner", children: [_jsx(Calendar, { localizer: localizer, events: events, startAccessor: "start", endAccessor: "end", titleAccessor: "category", selectable: true, 
                        // @ts-expect-error v1.11.4 型エラー回避
                        onSelectSlot: (slotInfo) => handleSelectSlot(slotInfo), onSelectEvent: handleSelectEvent, view: currentView, onView: (view) => setCurrentView(view), defaultView: "week", date: currentDate, onNavigate: (newDate) => setCurrentDate(newDate), step: 60, timeslots: 1, messages: {
                            today: "今日",
                            previous: "前",
                            next: "次",
                            month: "月",
                            week: "週",
                            day: "日",
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
                        }, eventPropGetter: (event) => ({
                            style: {
                                backgroundColor: event.category_color || "#ff9800",
                                color: "#fff",
                            },
                        }) }), isModalOpen && (_jsx(EventModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), initialData: selectedEvent
                            ? {
                                category: selectedEvent.category,
                                start: selectedEvent.start,
                                end: selectedEvent.end,
                                memo: "",
                            }
                            : selectedSlot
                                ? {
                                    category: "",
                                    start: selectedSlot.start,
                                    end: selectedSlot.end,
                                    memo: "",
                                }
                                : undefined, categories: categories, onSave: (data) => {
                            void handleSaveEvent(data);
                        }, onDelete: selectedEvent ? handleDeleteEvent : undefined }))] })] }));
}
export default CalendarPage;
