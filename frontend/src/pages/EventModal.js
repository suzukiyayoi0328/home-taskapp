import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import "./EventModal.css";
const EventModal = ({ isOpen, onClose, onSave, onDelete, initialData, categories, }) => {
    const [categoryId, setCategoryId] = useState("");
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [memo, setMemo] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const handleCategoryChange = (e) => {
        const selectedCategoryId = Number(e.target.value);
        const category = categories.find((c) => c.id === selectedCategoryId);
        setCategoryId(selectedCategoryId);
        setSelectedColor(category ? category.category_color : null);
    };
    const formatDateTimeLocal = (date) => {
        const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return offsetDate.toISOString().slice(0, 16);
    };
    // memo初期化
    useEffect(() => {
        if (initialData) {
            const categoryObj = categories.find((c) => c.name === initialData.category);
            setCategoryId(categoryObj ? categoryObj.id : "");
            setSelectedColor(categoryObj ? categoryObj.category_color : null);
            setStart(initialData.start);
            setEnd(initialData.end);
            setMemo(initialData.memo || "");
        }
        else {
            setCategoryId("");
            setSelectedColor(null);
            setStart(null);
            setEnd(null);
            setMemo("");
        }
    }, [initialData, categories]);
    const handleSave = () => {
        if (!start || !end || categoryId === "") {
            alert("カテゴリ、開始日時、終了日時は必須です！");
            return;
        }
        const categoryName = categories.find((c) => c.id === categoryId)?.name || "";
        onSave({
            category: categoryName,
            start,
            end,
            memo,
        });
        onClose();
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "back-button", children: _jsx("a", { href: "/mypage", children: "\u2190 \u30DE\u30A4\u30DA\u30FC\u30B8" }) }), isOpen && (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal-content", children: [_jsx("h2", { children: "\u4E88\u5B9A\u8FFD\u52A0 / \u7DE8\u96C6" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30AB\u30C6\u30B4\u30EA" }), _jsxs("div", { className: "category-row", children: [_jsxs("select", { value: categoryId, onChange: handleCategoryChange, className: "category-select", required: true, children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), categories.map((c) => (_jsx("option", { value: c.id, children: c.name }, c.id)))] }), _jsx("div", { className: "color-preview", style: {
                                                backgroundColor: selectedColor || "transparent",
                                            } })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "memo", children: "\u30E1\u30E2" }), _jsx("textarea", { id: "memo", value: memo, onChange: (e) => setMemo(e.target.value), placeholder: "\u30E1\u30E2\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044", rows: 4 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u958B\u59CB\u65E5\u6642" }), _jsx("input", { type: "datetime-local", value: start ? formatDateTimeLocal(start) : "", onChange: (e) => setStart(new Date(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u7D42\u4E86\u65E5\u6642" }), _jsx("input", { type: "datetime-local", value: end ? formatDateTimeLocal(end) : "", onChange: (e) => setEnd(new Date(e.target.value)) })] }), _jsxs("div", { className: "button-row", children: [_jsx("button", { onClick: handleSave, children: "\u4FDD\u5B58" }), onDelete && _jsx("button", { onClick: onDelete, children: "\u524A\u9664" }), _jsx("button", { onClick: onClose, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" })] })] }) }))] }));
};
export default EventModal;
