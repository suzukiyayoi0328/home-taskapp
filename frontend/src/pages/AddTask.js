import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AddTask.css";
function AddTask() {
    const [startTime, setStartTime] = useState("");
    const [deadline, setDeadline] = useState("");
    const [category, setCategory] = useState("");
    const [memo, setMemo] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const navigate = useNavigate();
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        const catObj = categories.find((c) => c.name === selectedCategory);
        setSelectedColor(catObj ? catObj.category_color : null);
    };
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/categories");
                console.log("📋 カテゴリ一覧取得:", response.data);
                setCategories(response.data);
            }
            catch (error) {
                console.error("❌ カテゴリ取得エラー:", error);
            }
        };
        fetchCategories();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/tasks", {
                memo,
                start_time: startTime,
                deadline,
                category,
            });
            console.log("✅ 登録成功:", response.data);
            alert("タスクが登録されました！");
            navigate("/mypage");
        }
        catch (error) {
            console.error("❌ 登録エラー:", error);
            alert("登録に失敗しました…");
        }
    };
    return (_jsx("div", { className: "add-task-page", children: _jsxs("div", { className: "add-task-card", children: [_jsx("button", { className: "back-button", onClick: () => navigate(-1), children: "\u2190 \u30DE\u30A4\u30DA\u30FC\u30B8\u306B\u623B\u308B" }), _jsx("h2", { className: "login-title", children: "\u30BF\u30B9\u30AF\u3092\u8FFD\u52A0" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30AB\u30C6\u30B4\u30EA" }), _jsxs("div", { className: "category-row", children: [_jsxs("select", { value: category, onChange: handleCategoryChange, className: "category-select", required: true, children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), categories.map((cat) => (_jsx("option", { value: cat.name, children: cat.name }, cat.id)))] }), _jsx("div", { className: "color-preview", style: {
                                                backgroundColor: selectedColor || "transparent", // 未選択時は透明
                                            } })] }), _jsx(Link, { to: "/edit-category", children: "\uFF0B \u30AB\u30C6\u30B4\u30EA\u3092\u7DE8\u96C6" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30E1\u30E2" }), _jsx("textarea", { value: memo, onChange: (e) => setMemo(e.target.value), rows: 4 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u958B\u59CB\u65E5\u6642" }), _jsx("input", { type: "datetime-local", value: startTime, onChange: (e) => setStartTime(e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u7D42\u4E86\u65E5\u6642" }), _jsx("input", { type: "datetime-local", value: deadline, onChange: (e) => setDeadline(e.target.value) }), _jsx("div", { style: { marginTop: "10px" }, children: _jsx(Link, { to: "/calendar", children: "\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u304B\u3089\u8A2D\u5B9A" }) })] }), _jsx("button", { type: "submit", className: "submit-button", children: "\u767B\u9332\u3059\u308B" })] })] }) }));
}
export default AddTask;
