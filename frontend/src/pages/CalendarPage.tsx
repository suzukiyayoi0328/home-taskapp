import {
  Calendar,
  momentLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import moment from "moment-timezone";
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
  category_id: number;
  category_color: string | null;
  memo?: string;
  attachment_url?: string | null;
  repeat_type?: "weekly" | "monthly" | "";
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
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "delete">("success");
  const [showToast, setShowToast] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const showToastWithMessage = (msg: string, type: "success" | "delete") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setIsFadingOut(false);

    setTimeout(() => setIsFadingOut(true), 3000);
    setTimeout(() => {
      setShowToast(false);
      setIsFadingOut(false);
    }, 4000);
  };

  type TaskFromApi = {
    id: number;
    category: string | null;
    category_id: number;
    start_time: string;
    deadline: string;
    category_color: string | null;
    memo: string | null;
    attachment_url?: string | null;
  };

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://home-taskapp-backend.onrender.com/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("APIから取得したデータ:", data);

      const formatted = data.map((task: TaskFromApi) => ({
        id: task.id,
        category: task.category || "",
        category_id: task.category_id,
        category_color: task.category_color || null,
        start: new Date(task.start_time),
        end: new Date(task.deadline),
        memo: task.memo || "",
        attachment_url: task.attachment_url || "",
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("タスク取得エラー:", err);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://home-taskapp-backend.onrender.com/api/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

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
      return moment(date).format("YYYY-MM-DD HH:mm:ss"); // JSTへの補正はしない
    };
    const isEdit = !!selectedEvent;
    const url = isEdit
      ? `https://home-taskapp-backend.onrender.com/tasks/${selectedEvent!.id}`
      : "https://home-taskapp-backend.onrender.com/tasks";

    const method = isEdit ? "PUT" : "POST";
    const token = localStorage.getItem("token");

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_time: formatDate(data.start),
          deadline: formatDate(data.end),
          category: data.category,
          memo: data.memo,
          attachment_url: data.attachment_url ?? null,
          repeat_type: data.repeat_type || "",
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
      await fetch(
        `https://home-taskapp-backend.onrender.com/tasks/${selectedEvent.id}`,
        {
          method: "DELETE",
        }
      );
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
            ) => localizer.format(date, "ddd", culture),
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
            onShowToast={showToastWithMessage}
            initialData={
              selectedEvent
                ? {
                    category: String(selectedEvent.category_id),
                    start: selectedEvent.start,
                    end: selectedEvent.end,
                    memo: selectedEvent.memo || "",
                    repeat_type: selectedEvent.repeat_type || "",
                    attachment_url: selectedEvent.attachment_url || "",
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
      {showToast && (
        <div
          className={`toast ${toastType === "delete" ? "toast-delete" : ""} ${
            isFadingOut ? "hide" : ""
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
