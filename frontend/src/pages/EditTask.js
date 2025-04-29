import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./EditTask.css";
function EditTask() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null); // ← カラー用 state 追加
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:3001/api/categories");
                setCategories(res.data);
            }
            catch (err) {
                console.error("カテゴリ取得失敗", err);
            }
        };
        const fetchTask = async () => {
            const res = await fetch("http://localhost:3001/tasks/" + id);
            const data = await res.json();
            setTask(data);
        };
        fetchCategories();
        fetchTask();
    }, [id]);
    // task と categories が揃ったらカラーをセット
    useEffect(() => {
        if (task && categories.length > 0) {
            const color = categories.find((cat) => cat.name === task.category)?.category_color ||
                null;
            setSelectedColor(color);
        }
    }, [task, categories]);
    const handleSave = async () => {
        const sendData = {
            ...task,
            memo: task?.memo ?? "",
        };
        console.log("💾 保存するデータ:", sendData);
        try {
            await fetch(`http://localhost:3001/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sendData),
            });
            alert("更新しました！");
            navigate("/mypage");
        }
        catch (err) {
            console.error("保存失敗", err);
            alert("保存に失敗しました");
        }
    };
    return (_jsx("div", { className: "edit-task-page", children: _jsxs("div", { className: "edit-task-card", children: [_jsx("button", { className: "back-button", onClick: () => navigate(-1), children: "\u2190 \u30DE\u30A4\u30DA\u30FC\u30B8\u306B\u623B\u308B" }), _jsx("h2", { className: "login-title", children: "\u30BF\u30B9\u30AF\u3092\u7DE8\u96C6" }), task ? (_jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        handleSave();
                    }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30AB\u30C6\u30B4\u30EA" }), _jsxs("div", { className: "category-row", children: [_jsxs("select", { value: task.category ?? "", onChange: (e) => {
                                                const selectedCategory = e.target.value;
                                                setTask({ ...task, category: selectedCategory });
                                                const color = categories.find((cat) => cat.name === selectedCategory)
                                                    ?.category_color || null;
                                                setSelectedColor(color);
                                            }, className: "category-select", required: true, children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), categories.map((cat) => (_jsx("option", { value: cat.name, children: cat.name }, cat.id)))] }), _jsx("div", { className: "color-preview", style: {
                                                backgroundColor: selectedColor || "transparent", // 未選択時は透明
                                            } })] }), _jsx(Link, { to: "/edit-category", children: "\uFF0B \u30AB\u30C6\u30B4\u30EA\u3092\u7DE8\u96C6" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30E1\u30E2" }), _jsx("textarea", { value: task.memo ?? "", onChange: (e) => setTask({ ...task, memo: e.target.value }), rows: 4 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u958B\u59CB\u65E5\u6642" }), _jsx("input", { type: "datetime-local", value: task.start_time ? task.start_time.slice(0, 16) : "", onChange: (e) => setTask({ ...task, start_time: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u7D42\u4E86\u65E5\u6642" }), _jsx("input", { type: "datetime-local", value: task.deadline ? task.deadline.slice(0, 16) : "", onChange: (e) => setTask({ ...task, deadline: e.target.value }) })] }), _jsx("div", { className: "calendar-link", children: _jsx(Link, { to: "/calendar", children: "\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u304B\u3089\u8A2D\u5B9A" }) }), _jsx("button", { type: "submit", className: "submit-button", children: "\u4FDD\u5B58\u3059\u308B" })] })) : (_jsx("p", { children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." }))] }) }));
}
export default EditTask;
