import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CategoryEdit.css";
function CategoryEdit() {
    const [name, setName] = useState(""); // カテゴリ名
    const [color, setColor] = useState("#ffca39"); // カラー（デフォルト色）
    const [message, setMessage] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();
    const colorOptions = [
        "#ffca39",
        "#ff9800",
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4caf50",
        "#8bc34a",
        "#cddc39",
        "#795548",
    ];
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
        fetchCategories();
    }, []);
    const handleDeleteCategory = async () => {
        if (!selectedCategory)
            return;
        if (!window.confirm("本当に削除しますか？"))
            return;
        try {
            await axios.delete(`http://localhost:3001/api/categories/${selectedCategory}`);
            alert("カテゴリを削除しました！");
            const res = await axios.get("http://localhost:3001/api/categories");
            setCategories(res.data);
            setSelectedCategory("");
        }
        catch (err) {
            console.error("カテゴリ削除失敗", err);
            alert("削除に失敗しました…");
        }
    };
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setMessage("カテゴリ名を入力してください！");
            return;
        }
        try {
            const res = await axios.post("http://localhost:3001/api/categories", {
                name,
                category_color: color, // 色も送信
            });
            console.log("✅ カテゴリ追加成功:", res.data);
            setMessage("カテゴリを追加しました！");
            setName("");
            setColor("#ffca39"); // 初期色に戻す
        }
        catch (err) {
            console.error("❌ カテゴリ追加失敗", err);
            setMessage("カテゴリの追加に失敗しました…");
        }
    };
    return (_jsx("div", { className: "category-edit-page", children: _jsxs("div", { className: "category-edit-card", children: [_jsx("h2", { className: "login-title", children: "\u30AB\u30C6\u30B4\u30EA\u3092\u7DE8\u96C6" }), _jsxs("form", { onSubmit: handleAddCategory, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30AB\u30C6\u30B4\u30EA\u540D" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30AB\u30E9\u30FC\u9078\u629E" }), _jsx("div", { className: "color-palette", children: colorOptions.map((c) => (_jsx("div", { className: `color-box ${color === c ? "selected" : ""}`, style: { backgroundColor: c }, onClick: () => setColor(c) }, c))) })] }), _jsx("button", { type: "submit", className: "submit-button", children: "\u8FFD\u52A0\u3059\u308B" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u30AB\u30C6\u30B4\u30EA\u524A\u9664" }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] }), _jsx("button", { type: "button", className: "delete-button", onClick: handleDeleteCategory, children: "\u524A\u9664\u3059\u308B" })] })] }), message && _jsx("p", { style: { marginTop: "10px" }, children: message }), _jsx("button", { className: "back-button", onClick: () => navigate(-1), children: "\u2190 \u30BF\u30B9\u30AF\u3092\u7DE8\u96C6\u306B\u623B\u308B" })] }) }));
}
export default CategoryEdit;
