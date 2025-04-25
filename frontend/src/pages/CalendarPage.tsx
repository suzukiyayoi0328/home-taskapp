import {
  Calendar,
  momentLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import moment from "moment-timezone";
// @ts-expect-error 型定義がないので無視
import "moment/locale/ja";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useCallback } from "react";
import "./CalendarPage.css";
import EventModal, { EventData } from "./EventModal";
import { useNavigate } from "react-router-dom";

moment.locale("ja");
moment.tz.setDefault("Asia/Tokyo");

const localizer = momentLocalizer(moment);

type MyEvent = RBCEvent & {
  id: number;
  category: string;
  category_color: string | null;
};

type MySlotInfo = {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
};

function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categories, setCategories] = useState<
    { id: number; name: string; category_color: string | null }[]
  >([]);
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">(
    "week"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MySlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

  type TaskFromApi = {
    id: number;
    category: string | null;
    start_time: string;
    deadline: string;
    category_color: string | null;
  };

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/tasks");
      const data = await res.json();
      console.log("📦 タスク一覧取得結果:", data);

      const formatted = data.map((task: TaskFromApi) => ({
        id: task.id,
        category: task.category || "",
        category_color: task.category_color || null,
        start: new Date(task.start_time), // ← ここ補正なしでOK！
        end: new Date(task.deadline),
      }));
      setEvents(formatted);
    } catch (err) {
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
      } catch (err) {
        console.error("カテゴリ取得エラー:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSelectSlot = (slotInfo: MySlotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (data: EventData) => {
    const formatDate = (date: Date) => {
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    };
    const categoryObj = categories.find((c) => c.name === data.category);
    const categoryId = categoryObj ? categoryObj.id : null;

    const isEdit = !!selectedEvent;
    const url = isEdit
      ? `http://localhost:3001/tasks/${selectedEvent!.id}`
      : "http://localhost:3001/tasks";

    const method = isEdit ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: formatDate(data.start),
          deadline: formatDate(data.end),
          category: categoryId,
          memo: data.memo,
        }),
      });
      fetchTasks();
    } catch (err) {
      console.error("保存エラー:", err);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await fetch(`http://localhost:3001/tasks/${selectedEvent.id}`, {
        method: "DELETE",
      });
      fetchTasks();
    } catch (err) {
      console.error("削除エラー:", err);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="calendar-wrapper">
      <button className="back-button" onClick={() => navigate("/mypage")}>
        ← マイページ
      </button>
      <div className="calendar-inner">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="category"
          selectable
          // @ts-expect-error v1.11.4 型エラー回避
          onSelectSlot={(slotInfo: object) =>
            handleSelectSlot(slotInfo as MySlotInfo)
          }
          onSelectEvent={handleSelectEvent}
          view={currentView}
          onView={(view: "month" | "week" | "day") => setCurrentView(view)}
          defaultView="week"
          date={currentDate}
          onNavigate={(newDate: Date) => setCurrentDate(newDate)}
          step={60}
          timeslots={1}
          messages={{
            today: "今日",
            previous: "前",
            next: "次",
            month: "月",
            week: "週",
            day: "日",
          }}
          eventPropGetter={(event: MyEvent) => ({
            style: {
              backgroundColor: event.category_color || "#ff9800",
              color: "#fff",
            },
          })}
        />

        {isModalOpen && (
          <EventModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={
              selectedEvent
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
                : undefined
            }
            categories={categories}
            onSave={(data: EventData) => {
              void handleSaveEvent(data);
            }}
            onDelete={selectedEvent ? handleDeleteEvent : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarPage;
