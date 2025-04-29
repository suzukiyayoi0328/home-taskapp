import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, momentLocalizer, } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarModal.css";
const localizer = momentLocalizer(moment);
const CalendarModal = ({ isOpen, onClose, events }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-content", children: [_jsx("button", { onClick: onClose, children: "\u9589\u3058\u308B" }), _jsx(Calendar, { localizer: localizer, events: events, startAccessor: "start", endAccessor: "end", titleAccessor: "category", selectable: false, views: ["month", "week", "day"], 
                    // @ts-expect-error defaultView 型問題を無視
                    defaultView: "month" })] }) }));
};
export default CalendarModal;
