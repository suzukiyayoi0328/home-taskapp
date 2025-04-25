import {
  Calendar,
  momentLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarModal.css";

const localizer = momentLocalizer(moment);

type MyEvent = RBCEvent & {
  id: number;
  category: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  events: MyEvent[];
};

const CalendarModal: React.FC<Props> = ({ isOpen, onClose, events }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={onClose}>閉じる</button>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="category"
          selectable={false}
          views={["month", "week", "day"]}
          // @ts-expect-error defaultView 型問題を無視
          defaultView="month"
        />
      </div>
    </div>
  );
};

export default CalendarModal;
